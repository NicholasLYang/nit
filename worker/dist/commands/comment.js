"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const promises_1 = require("node:fs/promises");
class Comment extends core_1.Command {
    async run() {
        const { args: { comment }, flags: { file, line }, } = await this.parse(Comment);
        return this.addComment(comment, file, Number.parseInt(line) - 1);
    }
    getIndentLevel(lines, lineNumber) {
        let line = lines[lineNumber];
        while (line === "") {
            lineNumber -= 1;
            line = lines[lineNumber];
        }
        console.log(line);
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
    async addComment(comment, file, line) {
        const code = await (0, promises_1.readFile)(file, "utf8");
        const lines = code.split("\n");
        const indentLevel = this.getIndentLevel(lines, line);
        const indent = " ".repeat(indentLevel);
        const newCode = `${lines.slice(0, line).join("\n")}
${indent}// ${comment}
${lines.slice(line).join("\n")}`;
        await (0, promises_1.writeFile)(file, newCode, "utf8");
    }
}
exports.default = Comment;
Comment.description = "Adds a comment to a file";
Comment.examples = [
    '<%= config.bin %> <%= command.id %> "This is a comment" 10',
];
Comment.args = [{ name: "comment", required: true }];
Comment.flags = {
    file: core_1.Flags.string({
        description: "File for the comment",
        required: true,
    }),
    line: core_1.Flags.string({
        description: "Line for the comment",
        required: true,
    }),
};
