import { Command } from "@oclif/core";
export default class Rename extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        repoPath: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        file: import("@oclif/core/lib/interfaces").OptionFlag<string>;
        line: import("@oclif/core/lib/interfaces").OptionFlag<string>;
        language: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
    };
    static args: {
        name: string;
        required: boolean;
    }[];
    run(): Promise<void>;
}
