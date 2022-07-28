import { Command } from "@oclif/core";
import { readFile } from "node:fs/promises";
import { access, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

export default class Languages extends Command {
  public async run(): Promise<void> {
    const configDir = path.join(homedir(), ".refactor-cli");
    try {
      await access(configDir);
      const serversText = await readFile(
        path.join(configDir, "servers.json"),
        "utf8"
      );
      const servers = JSON.parse(serversText);
      for (const server of servers) {
        console.log(server.language);
      }
    } catch (e) {
      console.error(e);
      await mkdir("~/.refactor-cli");
    }
  }
}
