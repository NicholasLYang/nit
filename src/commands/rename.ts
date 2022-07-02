import { Command, Flags } from "@oclif/core";
import { renameSymbol } from "../rename";
import path from "node:path";

export default class Rename extends Command {
  static description = "Rename a symbol";

  static examples = [
    "<%= config.bin %> <%= command.id %> Input FileInput --file test.js --line 10",
  ];

  static flags = {
    file: Flags.string({
      description: "File that contains symbol",
      required: true,
    }),
    // TODO: Make optional and offer some way for users to disambiguate
    line: Flags.string({
      description: "Line that contains symbol",
      required: true,
    }),
  };

  static args = [
    { name: "oldName", required: true },
    { name: "newName", required: true },
  ];

  public async run(): Promise<void> {
    const {
      args: { oldName, newName },
      flags: { file, line },
    } = await this.parse(Rename);
    const lineNumber = Number.parseInt(line);
    if (Number.isNaN(lineNumber)) {
      throw new TypeError(`Invalid line: '${line}'`);
    }

    const filePath = path.join(process.cwd(), file);
    console.log(filePath);
    // We decrement lineNumber because text editors tend to use 1-indexed line numbers
    await renameSymbol(".", filePath, oldName, newName, lineNumber - 1);
  }
}
