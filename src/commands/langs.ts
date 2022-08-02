import { Command } from "@oclif/core";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import fetch from "node-fetch";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import { createWriteStream } from "node:fs";
import { chmod, rm } from "node:fs/promises";
import { getCLIDirectory } from "../utils";

const LANGUAGES = {
  rust: {
    serverType: "Rust Analyzer",
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
    const configDir = await getCLIDirectory();

    try {
      const serversText = await readFile(
        path.join(configDir, "servers.json"),
        "utf8"
      );
      const servers = JSON.parse(serversText);
      if (servers.length === 0) {
        console.log("No languages installed.");
      }

      for (const server of servers) {
        console.log(`${server.language}: ${server.serverType}`);
      }
    } catch {
      console.log("No languages installed.");
      await writeFile(path.join(configDir, "servers.json"), "[]");
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
      }

      const languageDirectory = path.join(await getCLIDirectory(), "servers");
      const languageServerPath = path.join(
        languageDirectory,
        `${subCommandArg}-server`
      );

      await mkdir(languageDirectory, { recursive: true });

      console.log(`Downloading language server for ${subCommandArg}...`);

      await downloadAndUnzip(downloadUrl, languageServerPath);
      await chmod(languageServerPath, 0o755);
      await addLanguageToServersFile({
        language: subCommandArg,
        serverType: language.serverType,
      });

      console.log(
        `Successfully installed language server for ${subCommandArg}`
      );
    }
  }
}

/**
 * Downloads a file from url and unzips it
 * @param url
 * @param fileName
 */
async function downloadAndUnzip(url: string, fileName: string) {
  const response = await fetch(url);

  if (!response.ok)
    throw new Error(`Unexpected response ${response.statusText}`);

  const outputStream = createWriteStream(fileName);

  const gunzip = createGunzip();

  await pipeline(response.body, gunzip, outputStream);
}

async function addLanguageToServersFile(language: object) {
  const cliDirectory = await getCLIDirectory();
  const serversPath = path.join(cliDirectory, "servers.json");
  const serversText = await readFile(serversPath, "utf8");

  try {
    const servers = JSON.parse(serversText);
    servers.push(language);

    await writeFile(serversPath, JSON.stringify(servers));
  } catch (error) {
    console.error(`Failed to read internal data: ${error}`);

    await writeFile(serversPath, "[]");
  }
}
