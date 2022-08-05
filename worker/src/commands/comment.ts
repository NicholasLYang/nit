import { Command, Flags } from "@oclif/core";
import { readFile, writeFile } from "node:fs/promises";

export default class Comment extends Command {
  static description = "Adds a comment to a file";

  static examples = [
    '<%= config.bin %> <%= command.id %> "This is a comment" 10',
  ];

  static args = [{ name: "comment", required: true }];

  static flags = {
    file: Flags.string({
      description: "File for the comment",
      required: true,
    }),
    line: Flags.string({
      description: "Line for the comment",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const {
      args: { comment },
      flags: { file, line },
    } = await this.parse(Comment);

    return this.addComment(comment, file, Number.parseInt(line) - 1);
  }

  private getIndentLevel(lines: string[], lineNumber: number) {
    let line = lines[lineNumber];
    while (line === "") {
      lineNumber -= 1;
      line = lines[lineNumber];
    }

    const leadingWhitespace = /^\s*/.exec(line);
    if (leadingWhitespace) {
      return leadingWhitespace[0].length;
    }

    return 0;
  }

  /**
   * Adds a comment to a file at a given line. Makes sure to check for potential issues like template literals,
   * and indents the code accordingly
   * @param comment
   * @param file
   * @param line
   */
  async addComment(comment: string, file: string, line: number): Promise<void> {
    const code = await readFile(file, "utf8");
    const lines = code.split("\n");

    const indentLevel = this.getIndentLevel(lines, line);
    const indent = " ".repeat(indentLevel);
    const newCode = `${lines.slice(0, line).join("\n")}
${indent}// ${comment}
${lines.slice(line).join("\n")}`;

    await writeFile(file, newCode, "utf8");
  }
}
