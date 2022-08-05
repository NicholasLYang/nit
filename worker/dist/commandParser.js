"use strict";
/**
 * Parses nit commands and turns them into standard job requests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCommand = void 0;
var CommandType;
(function (CommandType) {
    CommandType["Rename"] = "rename";
    CommandType["Comment"] = "comment";
    CommandType["Format"] = "format";
    CommandType["Lint"] = "lint";
})(CommandType || (CommandType = {}));
const commandRegex = /\s*(?<commandType>rename|comment)\s*\((?<args>\s*(?:\w+\s*,\s*)*(?:\w+)?\s*)\)\s*/;
function parseCommand(text) {
    const matches = text.match(commandRegex);
    if (!matches) {
        return undefined;
    }
    const { commandType, args } = matches.groups;
    const parsedArgs = args
        .split(",")
        .map((arg) => arg.trim())
        .filter((arg) => arg !== "");
    switch (commandType) {
        case "rename":
            if (parsedArgs.length !== 2) {
                throw new Error(`Expected 2 arguments for rename command`);
            }
            return {
                type: CommandType.Rename,
                oldName: parsedArgs[0],
                newName: parsedArgs[1],
            };
        case "comment":
            if (parsedArgs.length !== 1) {
                throw new Error(`Expected 1 argument for comment command`);
            }
            return {
                type: CommandType.Comment,
                comment: parsedArgs[0],
            };
    }
}
exports.parseCommand = parseCommand;
