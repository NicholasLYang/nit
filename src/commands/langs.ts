import { Command } from "@oclif/core";
import { readFile } from "node:fs/promises";
import { access, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import fetch from "node-fetch";

const LANGUAGES = {
  rust: {
    source: {
      darwin: {
        arm64:
          "https://github.com/rust-lang/rust-analyzer/releases/download/2022-07-25/rust-analyzer-aarch64-apple-darwin.gz",
        x64: "https://github.com/rust-lang/rust-analyzer/releases/download/2022-07-25/rust-analyzer-x86_64-apple-darwin.gz",
      },
      linux: {
        arm64:
          "https://github.com/rust-lang/rust-analyzer/releases/download/2022-07-25/rust-analyzer-aarch64-unknown-linux-gnu.gz",
        x64: "https://github.com/rust-lang/rust-analyzer/releases/download/2022-07-25/rust-analyzer-x86_64-unknown-linux-gnu.gz",
      },
      win32: {
        arm64:
          "https://github.com/rust-lang/rust-analyzer/releases/download/2022-07-25/rust-analyzer-aarch64-pc-windows-msvc.gz",
        x64: "https://github.com/rust-lang/rust-analyzer/releases/download/2022-07-25/rust-analyzer-x86_64-pc-windows-msvc.gz",
      },
    },
  },
};

export default class Languages extends Command {
  static description =
    "sub-command for handling the different installed programming languages";

  static args = [{ name: "subCommand" }, { name: "subCommandArg" }];

  async listInstalledLanguages(): Promise<void> {
    const configDir = path.join(homedir(), ".refactor-cli");
    try {
      await access(configDir);
      const serversText = await readFile(
        path.join(configDir, "servers.json"),
        "utf8"
      );
      const servers = JSON.parse(serversText);
      if (servers.length === 0) {
        console.log("No languages installed.");
      }

      for (const server of servers) {
        console.log(server.language);
      }
    } catch (e) {
      console.error(e);
      await mkdir("~/.refactor-cli");
    }
  }

  public async run(): Promise<void> {
    const {
      args: { subCommand, subCommandArg },
    } = await this.parse(Languages);

    if (!subCommand) {
      console.log(
        `===================
Installed languages
===================`
      );
      await this.listInstalledLanguages();
    } else if (subCommand === "installed") {
      await this.listInstalledLanguages();
    } else if (subCommand === "install") {
      if (!(subCommandArg in LANGUAGES)) {
        console.error(`Invalid language ${subCommand}`);
        return;
      }

      const language = LANGUAGES[subCommandArg as keyof typeof LANGUAGES];

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const downloadUrl = language.source[process.platform]?.[process.arch];

      if (!downloadUrl) {
        console.error(
          "No valid downloadable source for your OS and architecture, sorry!"
        );
        return;
      }

      const response = await fetch(downloadUrl);
      console.log(response);
    }
  }
}
