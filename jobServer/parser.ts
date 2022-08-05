/**
 * Parses nit commands and turns them into standard job requests
 */

enum CommandType {
  Rename = "rename",
  Comment = "comment",
  Format = "format",
  Lint = "lint",
}

/**
 * Type for nit commands. What's always passed with a nit command
 * is the line and file info (even if it's not necessary).
 */
type Command =
  | {
      type: CommandType.Rename;
      oldName: string;
      newName: string;
    }
  | { type: CommandType.Comment; comment: string };

const commandRegex =
  /\s*(?<commandType>rename|comment)\s*\((?<args>\s*(?:\w+\s*,\s*)*(?:\w+)?\s*)\)\s*/;

export function parseCommand(text: string): Command | undefined {
  const matches = text.match(commandRegex);
  if (!matches) {
    return undefined;
  }

  const { commandType, args } = matches.groups as {
    commandType: string;
    args: string;
  };

  const parsedArgs = args
    .split(",")
    .map((arg: string) => arg.trim())
    .filter((arg: string) => arg !== "");

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
