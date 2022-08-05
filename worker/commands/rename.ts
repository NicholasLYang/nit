import { Command, Flags } from "@oclif/core";
import { renameSymbol } from "../rename";
import path from "node:path";
import { Language } from "../utils";

function getLanguageFromExtension(ext: string) {
  switch (ext) {
    case ".rs":
      return Language.Rust;
    default:
      return undefined;
  }
}

export default class Rename extends Command {
  static description = "Rename a symbol";

  static examples = [
    "<%= config.bin %> <%= command.id %> Input FileInput --file test.js --line 10",
  ];

  static flags = {
    repoPath: Flags.string({
      description: "Repository",
      required: false,
    }),
    file: Flags.string({
      description: "File that contains symbol",
      required: true,
    }),
    // TODO: Make optional and offer some way for users to disambiguate
    line: Flags.string({
      description: "Line that contains symbol",
      required: true,
    }),
    language: Flags.string({
      description: "The programming language for the project",
    }),
  };

  static args = [
    { name: "oldName", required: true },
    { name: "newName", required: true },
  ];

  public async run(): Promise<void> {
    const {
      args: { oldName, newName },
      flags: { file, line, repoPath, language },
    } = await this.parse(Rename);
    const lineNumber = Number.parseInt(line);
    if (Number.isNaN(lineNumber)) {
      throw new TypeError(`Invalid line: '${line}'`);
    }

    const extension = path.extname(file);
    const filePath = path.resolve(file);
    const resolvedRepoPath = path.resolve(repoPath || ".");

    const projectLanguage = language || getLanguageFromExtension(extension);

    if (!projectLanguage) {
      throw new Error(
        `Unable to determine language for project. Please include --language flag`
      );
    }

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
  }
}
