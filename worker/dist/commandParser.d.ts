/**
 * Parses nit commands and turns them into standard job requests
 */
declare enum CommandType {
    Rename = "rename",
    Comment = "comment",
    Format = "format",
    Lint = "lint"
}
/**
 * Type for nit commands. What's always passed with a nit command
 * is the line and file info (even if it's not necessary).
 */
declare type Command = {
    type: CommandType.Rename;
    oldName: string;
    newName: string;
} | {
    type: CommandType.Comment;
    comment: string;
};
export declare function parseCommand(text: string): Command | undefined;
export {};
