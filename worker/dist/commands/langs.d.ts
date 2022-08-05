import { Command } from "@oclif/core";
export default class Languages extends Command {
    static description: string;
    static args: {
        name: string;
    }[];
    listInstalledLanguages(): Promise<void>;
    run(): Promise<void>;
}
