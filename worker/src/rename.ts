import * as cp from "node:child_process";
import {
  CreateFile,
  createProtocolConnection,
  DeleteFile,
  DidOpenTextDocumentNotification,
  InitializedNotification,
  InitializeParams,
  InitializeRequest,
  Logger,
  PrepareRenameRequest,
  ProtocolConnection,
  ProtocolRequestType,
  RenameFile,
  RenameRequest,
  TextDocument,
  TextDocumentEdit,
} from "vscode-languageserver-protocol";
import { StreamMessageReader, StreamMessageWriter } from "vscode-jsonrpc/node";
import { readFile, rm, writeFile, rename } from "node:fs/promises";
import { delay, fileExists } from "./utils";
import path from "node:path";

class MyLogger implements Logger {
  error(message: string): void {
    console.error(`ERROR: ${message}`);
  }

  info(message: string): void {
    console.log(`INFO: ${message}`);
  }

  log(message: string): void {
    console.log(`LOG: ${message}`);
  }

  warn(message: string): void {
    console.log(`WARN: ${message}`);
  }
}

/**
 * For a request sent to rust-analyzer, there's a chance that rust-analyzer is still
 * initializing or loading. If that is the case, we get either a
 * "waiting for cargo metadata or cargo check" or "content modified" as a response.
 * We loop until we get a different response
 */
async function sendRequest<P, R, PR, E, RO>(
  connection: ProtocolConnection,
  type: ProtocolRequestType<P, R, PR, E, RO>,
  params: P
) {
  let waitTime = 1000;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await connection.sendRequest(type, params);
    } catch (e: any) {
      if (process.env.LOG_LEVEL === "error") {
        console.error(e);
      }

      if (
        e.message !== "waiting for cargo metadata or cargo check" &&
        e.message !== "content modified"
      ) {
        throw e;
      }
    }

    await delay(waitTime);
    console.log(`wait time is now ${waitTime}`);
    waitTime *= 2;
  }
}

async function initializeConnection(
  repoPath: string,
  rustAnalyzerPath: string
) {
  const lspProcess = cp.spawn(rustAnalyzerPath);

  if (process.env.LOG_LEVEL === "info") {
    lspProcess.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });
  }

  if (process.env.LOG_LEVEL === "error" || process.env.LOG_LEVEL === "info") {
    lspProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });
  }

  const logger = new MyLogger();

  const connection = createProtocolConnection(
    new StreamMessageReader(lspProcess.stdout),
    new StreamMessageWriter(lspProcess.stdin),
    logger
  );
  connection.listen();

  const repoUri = `file://${repoPath}`;

  const init: InitializeParams = {
    rootUri: repoUri,
    processId: 1,
    capabilities: {},
    workspaceFolders: [],
  };

  await connection.sendRequest(InitializeRequest.type, init);

  connection.onNotification(InitializedNotification.type, console.log);
  await connection.sendNotification(InitializedNotification.type, {});

  return { connection, lspProcess };
}

async function getValidPositions(
  connection: ProtocolConnection,
  filePath: string,
  lineNumber: number,
  symbolPositions: number[]
) {
  const validPositions = [];
  const uri = `file://${filePath}`;
  const text = await readFile(filePath, "utf-8");

  await connection.sendNotification(DidOpenTextDocumentNotification.type, {
    textDocument: {
      uri,
      languageId: "rust",
      version: 1,
      text,
    },
  });

  for (const charIndex of symbolPositions) {
    try {
      const position = { line: lineNumber, character: charIndex };

      await sendRequest(connection, PrepareRenameRequest.type, {
        textDocument: { uri },
        position,
      });

      validPositions.push(position);
    } catch (e: any) {
      if (
        e.code !== -32_602 ||
        e.message !== "No references found at position"
      ) {
        throw e;
      }
    }
  }

  return validPositions;
}

async function getRenameChanges(
  connection: ProtocolConnection,
  documentUri: string,
  position: { line: number; character: number },
  newName: string
) {
  return sendRequest(connection, RenameRequest.type, {
    newName,
    textDocument: {
      uri: documentUri,
    },
    position,
  });
}

async function getLine(path: string, line: number) {
  let linesLeft = line;
  const fileContents = await readFile(path, "utf8");
  if (linesLeft === 0) {
    const newlineIndex = fileContents.indexOf("\n");
    return fileContents.slice(0, newlineIndex);
  }

  for (let i = 0; i < fileContents.length; i++) {
    if (fileContents[i] === "\n") {
      linesLeft -= 1;
      if (linesLeft === 0) {
        const newlineIndex = fileContents.indexOf("\n", i + 1);
        return fileContents.slice(i + 1, newlineIndex);
      }
    }
  }

  return "";
}

function getAllMatches(s: string, substring: string) {
  const matches = [];
  let index = 0;
  while (true) {
    const match = s.indexOf(substring, index);

    if (match === -1) {
      return matches;
    }

    matches.push(match);
    index = match + 1;
  }
}

async function createTextDocument(uri: string) {
  if (!uri.startsWith("file://")) {
    throw new Error("Invalid uri: " + uri);
  }

  const path = uri.slice(7);
  const fileContent = await readFile(path, "utf8");
  return TextDocument.create(uri, "rust", 0, fileContent);
}

/**
 * @param repoPath
 * @param filePath
 * @param name - Old name for the symbol
 * @param newName
 * @param lineNumber - Line number for the symbol. 0-indexed
 * unlike most text editors' line numbers
 * @param language
 * @param rustAnalyzerPath
 */
export async function renameSymbol(
  repoPath: string,
  filePath: string,
  name: string,
  newName: string,
  lineNumber: number,
  language: string,
  rustAnalyzerPath: string
): Promise<Set<string>> {
  const line = await getLine(filePath, lineNumber);
  const matches = getAllMatches(line, name);
  const editedFiles = new Set<string>();

  console.log("Initializing connection");
  const { connection, lspProcess } = await initializeConnection(
    repoPath,
    rustAnalyzerPath
  );

  console.log("Getting positions");
  const validPositions = await getValidPositions(
    connection,
    filePath,
    lineNumber,
    matches
  );

  if (validPositions.length === 0) {
    lspProcess.kill();
    throw new Error(
      `There is no \`${name}\` on line ${lineNumber + 1}:\n ${
        lineNumber + 1
      } | ${line}`
    );
  }

  if (validPositions.length === 1) {
    console.log("Getting rename changes...");
    const result = await getRenameChanges(
      connection,
      `file://${filePath}`,
      validPositions[0]!,
      newName
    );

    if (result?.documentChanges) {
      console.log("Applying changes");
      await Promise.all(
        result.documentChanges
          .map(async (change) => {
            if (isTextDocumentEdit(change)) {
              editedFiles.add(change.textDocument.uri);
              const document = await createTextDocument(
                change.textDocument.uri
              );
              return writeFile(
                document.uri.slice(7),
                TextDocument.applyEdits(document, change.edits)
              );
            }

            if (change.kind === "rename") {
              editedFiles.add(change.newUri);
              return renameFile(change);
            }

            if (change.kind === "create") {
              editedFiles.add(change.uri);
              return createFile(change);
            }

            if (change.kind === "delete") {
              return deleteFile(change);
            }
          })
          .filter((a) => a !== undefined)
      );
    }
  } else {
    lspProcess.kill();
    throw new Error(
      `Ambiguous request, there are multiple valid \`${name}\` on line ${
        lineNumber + 1
      }`
    );
  }

  lspProcess.kill();

  return editedFiles;
}

function isTextDocumentEdit(
  value: TextDocumentEdit | CreateFile | RenameFile | DeleteFile
): value is TextDocumentEdit {
  return "edits" in value;
}

async function renameFile(renameInfo: RenameFile) {
  const oldFile = renameInfo.oldUri.slice(7);
  const newFile = renameInfo.newUri.slice(7);

  if (await fileExists(newFile)) {
    if (renameInfo.options && renameInfo.options.overwrite) {
      await rename(oldFile, newFile);
    }
  } else {
    await rename(oldFile, newFile);
  }
}

async function createFile(createInfo: CreateFile) {
  const file = createInfo.uri.slice(7);

  if (await fileExists(file)) {
    if (createInfo.options && createInfo.options.overwrite) {
      await writeFile(file, "");
    }
  } else {
    await writeFile(file, "");
  }
}

async function deleteFile(deleteInfo: DeleteFile) {
  const file = deleteInfo.uri.slice(7);

  await rm(file, { recursive: deleteInfo.options?.recursive });
}
