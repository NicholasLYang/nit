import { Command } from "@oclif/core";
export default class Comment extends Command {
    static description: string;
    static examples: string[];
    static args: {
        name: string;
        required: boolean;
    }[];
    static flags: {
        file: import("@oclif/core/lib/interfaces").OptionFlag<string>;
        line: import("@oclif/core/lib/interfaces").OptionFlag<string>;
    };
    run(): Promise<void>;
    getIndentLevel(lines: string[], lineNumber: number): number;
    /**
     * Adds a comment to a file at a given line. Makes sure to check for potential issues like template literals,
     * and indents the code accordingly
     * @param comment
     * @param file
     * @param line
     */
    addComment(comment: string, file: string, line: number): Promise<void>;
}
