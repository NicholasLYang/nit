import { renameSymbol } from "../rename";
import path from "node:path";
import { Language } from "../utils";
import { setupJob, wrapUpJob } from "../lifecycle";

function getLanguageFromExtension(ext: string) {
  switch (ext) {
    case ".rs":
      return Language.Rust;
    default:
      return undefined;
  }
}

interface RenameParameters {
  repoUrl: string;
  commitHash: string;
  oldName: string;
  newName: string;
  lineNumber: string | number;
  file: string;
  language?: string;
}

export async function rename({
  repoUrl,
  commitHash,
  oldName,
  newName,
  lineNumber: line,
  file,
  language,
}: RenameParameters): Promise<void> {
  const { repoPath, branchName } = await setupJob(repoUrl, commitHash);

  const lineNumber = Number.parseInt(line);
  if (Number.isNaN(lineNumber)) {
    throw new TypeError(`Invalid line: '${line}'`);
  }

  const repoFile = path.join(repoPath, file);
  const extension = path.extname(repoFile);
  const filePath = path.resolve(repoFile);
  const resolvedRepoPath = path.resolve(repoPath);

  const projectLanguage = language || getLanguageFromExtension(extension);

  if (!projectLanguage) {
    throw new Error(
      `Unable to determine language for project. Please include --language flag`
    );
  }

  console.log("Starting rename...");

  // We decrement lineNumber because text editors tend to use 1-indexed line numbers
  await renameSymbol(
    resolvedRepoPath,
    filePath,
    oldName,
    newName,
    lineNumber - 1,
    projectLanguage
  );

  console.log(`Renamed '${oldName}' to '${newName}' in ${filePath}`);
  await wrapUpJob(oldName, newName, branchName, repoPath);
}
