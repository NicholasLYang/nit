"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameSymbol = void 0;
const tslib_1 = require("tslib");
const cp = tslib_1.__importStar(require("node:child_process"));
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const node_1 = require("vscode-jsonrpc/node");
const promises_1 = require("node:fs/promises");
const utils_1 = require("./utils");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const promises_2 = require("fs/promises");
class MyLogger {
    error(message) {
        console.error(`ERROR: ${message}`);
    }
    info(message) {
        console.log(`INFO: ${message}`);
    }
    log(message) {
        console.log(`LOG: ${message}`);
    }
    warn(message) {
        console.log(`WARN: ${message}`);
    }
}
/**
 * For a request sent to rust-analyzer, there's a chance that rust-analyzer is still
 * initializing or loading. If that is the case, we get either a
 * "waiting for cargo metadata or cargo check" or "content modified" as a response.
 * We loop until we get a different response
 */
async function sendRequest(connection, type, params) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            // eslint-disable-next-line no-await-in-loop
            return await connection.sendRequest(type, params);
        }
        catch (e) {
            if (e.message !== "waiting for cargo metadata or cargo check" &&
                e.message !== "content modified") {
                throw e;
            }
        }
    }
}
async function initializeConnection(repoPath, language) {
    const serverPath = node_path_1.default.join(await (0, utils_1.getCLIDirectory)(), "servers", `${language}-server`);
    try {
        await (0, promises_1.access)(serverPath);
    }
    catch {
        throw new Error(`Could not find language server for ${language}. Please install with \`nit langs install [LANGUAGE]\``);
    }
    const lspProcess = cp.spawn(serverPath);
    if (process.env.LOG_LEVEL === "info") {
        lspProcess.stdout.on("data", (data) => {
            console.log(`stdout: ${data}`);
        });
    }
    if (process.env.LOG_LEVEL === "error") {
        lspProcess.stderr.on("data", (data) => {
            console.error(`stderr: ${data}`);
        });
    }
    const logger = new MyLogger();
    const connection = (0, vscode_languageserver_protocol_1.createProtocolConnection)(new node_1.StreamMessageReader(lspProcess.stdout), new node_1.StreamMessageWriter(lspProcess.stdin), logger);
    connection.listen();
    const repoUri = `file://${repoPath}`;
    const init = {
        rootUri: repoUri,
        processId: 1,
        capabilities: {},
        workspaceFolders: [],
    };
    await connection.sendRequest(vscode_languageserver_protocol_1.InitializeRequest.type, init);
    connection.onNotification(vscode_languageserver_protocol_1.InitializedNotification.type, console.log);
    await connection.sendNotification(vscode_languageserver_protocol_1.InitializedNotification.type, {});
    return { connection, lspProcess };
}
async function getValidPositions(connection, filePath, lineNumber, symbolPositions) {
    const validPositions = [];
    const uri = `file://${filePath}`;
    const text = await (0, promises_1.readFile)(filePath, "utf-8");
    await connection.sendNotification(vscode_languageserver_protocol_1.DidOpenTextDocumentNotification.type, {
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
            await sendRequest(connection, vscode_languageserver_protocol_1.PrepareRenameRequest.type, {
                textDocument: { uri },
                position,
            });
            validPositions.push(position);
        }
        catch (e) {
            if (e.code !== -32602 ||
                e.message !== "No references found at position") {
                throw e;
            }
        }
    }
    return validPositions;
}
async function getRenameChanges(connection, documentUri, position, newName) {
    return sendRequest(connection, vscode_languageserver_protocol_1.RenameRequest.type, {
        newName,
        textDocument: {
            uri: documentUri,
        },
        position,
    });
}
async function getLine(path, line) {
    let linesLeft = line;
    const fileContents = await (0, promises_1.readFile)(path, "utf8");
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
function getAllMatches(s, substring) {
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
async function createTextDocument(uri) {
    if (!uri.startsWith("file://")) {
        throw new Error("Invalid uri: " + uri);
    }
    const path = uri.slice(7);
    const fileContent = await (0, promises_1.readFile)(path, "utf8");
    return vscode_languageserver_protocol_1.TextDocument.create(uri, "rust", 0, fileContent);
}
// NOTE: lineNumber is 0-indexed unlike most text editors
async function renameSymbol(repoPath, filePath, name, newName, lineNumber, language) {
    const line = await getLine(filePath, lineNumber);
    const matches = getAllMatches(line, name);
    const { connection, lspProcess } = await initializeConnection(repoPath, language);
    const validPositions = await getValidPositions(connection, filePath, lineNumber, matches);
    if (validPositions.length === 0) {
        lspProcess.kill();
        throw new Error(`There is no \`${name}\` on line ${lineNumber + 1}:\n ${lineNumber + 1} | ${line}`);
    }
    if (validPositions.length === 1) {
        const result = await getRenameChanges(connection, `file://${filePath}`, validPositions[0], newName);
        if (result === null || result === void 0 ? void 0 : result.documentChanges) {
            await Promise.all(result.documentChanges
                .map(async (change) => {
                if (isTextDocumentEdit(change)) {
                    const document = await createTextDocument(change.textDocument.uri);
                    return (0, promises_1.writeFile)(document.uri.slice(7), vscode_languageserver_protocol_1.TextDocument.applyEdits(document, change.edits));
                }
                else if (change.kind === "rename") {
                    return renameFile(change);
                }
                else if (change.kind === "create") {
                    return createFile(change);
                }
                else if (change.kind === "delete") {
                    return deleteFile(change);
                }
                return undefined;
            })
                .filter((a) => a !== undefined));
        }
    }
    else {
        lspProcess.kill();
        throw new Error(`Ambiguous request, there are multiple valid \`${name}\` on line ${lineNumber + 1}`);
    }
    lspProcess.kill();
}
exports.renameSymbol = renameSymbol;
function isTextDocumentEdit(value) {
    return "edits" in value;
}
async function renameFile(renameInfo) {
    const oldFile = renameInfo.oldUri.slice(7);
    const newFile = renameInfo.newUri.slice(7);
    if (await (0, utils_1.fileExists)(newFile)) {
        if (renameInfo.options && renameInfo.options.overwrite) {
            await (0, promises_2.rename)(oldFile, newFile);
        }
    }
    else {
        await (0, promises_2.rename)(oldFile, newFile);
    }
}
async function createFile(createInfo) {
    const file = createInfo.uri.slice(7);
    if (await (0, utils_1.fileExists)(file)) {
        if (createInfo.options && createInfo.options.overwrite) {
            await (0, promises_1.writeFile)(file, "");
        }
    }
    else {
        await (0, promises_1.writeFile)(file, "");
    }
}
async function deleteFile(deleteInfo) {
    var _a;
    const file = deleteInfo.uri.slice(7);
    await (0, promises_1.rm)(file, { recursive: (_a = deleteInfo.options) === null || _a === void 0 ? void 0 : _a.recursive });
}
