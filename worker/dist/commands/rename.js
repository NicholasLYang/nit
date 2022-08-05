"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const rename_1 = require("../rename");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const utils_1 = require("../utils");
function getLanguageFromExtension(ext) {
    switch (ext) {
        case ".rs":
            return utils_1.Language.Rust;
        default:
            return undefined;
    }
}
class Rename extends core_1.Command {
    async run() {
        const { args: { oldName, newName }, flags: { file, line, repoPath, language }, } = await this.parse(Rename);
        const lineNumber = Number.parseInt(line);
        if (Number.isNaN(lineNumber)) {
            throw new TypeError(`Invalid line: '${line}'`);
        }
        const extension = node_path_1.default.extname(file);
        const filePath = node_path_1.default.resolve(file);
        const resolvedRepoPath = node_path_1.default.resolve(repoPath || ".");
        const projectLanguage = language || getLanguageFromExtension(extension);
        if (!projectLanguage) {
            throw new Error(`Unable to determine language for project. Please include --language flag`);
        }
        // We decrement lineNumber because text editors tend to use 1-indexed line numbers
        await (0, rename_1.renameSymbol)(resolvedRepoPath, filePath, oldName, newName, lineNumber - 1, projectLanguage);
        console.log(`Renamed '${oldName}' to '${newName}' in ${filePath}`);
    }
}
exports.default = Rename;
Rename.description = "Rename a symbol";
Rename.examples = [
    "<%= config.bin %> <%= command.id %> Input FileInput --file test.js --line 10",
];
Rename.flags = {
    repoPath: core_1.Flags.string({
        description: "Repository",
        required: false,
    }),
    file: core_1.Flags.string({
        description: "File that contains symbol",
        required: true,
    }),
    // TODO: Make optional and offer some way for users to disambiguate
    line: core_1.Flags.string({
        description: "Line that contains symbol",
        required: true,
    }),
    language: core_1.Flags.string({
        description: "The programming language for the project",
    }),
};
Rename.args = [
    { name: "oldName", required: true },
    { name: "newName", required: true },
];
