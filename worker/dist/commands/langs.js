"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const promises_1 = require("node:fs/promises");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const promises_2 = require("node:stream/promises");
const node_zlib_1 = require("node:zlib");
const node_fs_1 = require("node:fs");
const promises_3 = require("node:fs/promises");
const utils_1 = require("../utils");
const LANGUAGES = {
    rust: {
        serverType: "Rust Analyzer",
        source: {
            darwin: {
                arm64: "https://github.com/rust-lang/rust-analyzer/releases/download/2022-07-25/rust-analyzer-aarch64-apple-darwin.gz",
                x64: "https://github.com/rust-lang/rust-analyzer/releases/download/2022-07-25/rust-analyzer-x86_64-apple-darwin.gz",
            },
            linux: {
                arm64: "https://github.com/rust-lang/rust-analyzer/releases/download/2022-07-25/rust-analyzer-aarch64-unknown-linux-gnu.gz",
                x64: "https://github.com/rust-lang/rust-analyzer/releases/download/2022-07-25/rust-analyzer-x86_64-unknown-linux-gnu.gz",
            },
            win32: {
                arm64: "https://github.com/rust-lang/rust-analyzer/releases/download/2022-07-25/rust-analyzer-aarch64-pc-windows-msvc.gz",
                x64: "https://github.com/rust-lang/rust-analyzer/releases/download/2022-07-25/rust-analyzer-x86_64-pc-windows-msvc.gz",
            },
        },
    },
};
class Languages extends core_1.Command {
    async listInstalledLanguages() {
        const configDir = await (0, utils_1.getCLIDirectory)();
        try {
            const serversText = await (0, promises_1.readFile)(node_path_1.default.join(configDir, "servers.json"), "utf8");
            const servers = JSON.parse(serversText);
            if (servers.length === 0) {
                console.log("No languages installed.");
            }
            for (const server of servers) {
                console.log(`${server.language}: ${server.serverType}`);
            }
        }
        catch {
            console.log("No languages installed.");
            await (0, promises_1.writeFile)(node_path_1.default.join(configDir, "servers.json"), "[]");
        }
    }
    async run() {
        var _a;
        const { args: { subCommand, subCommandArg }, } = await this.parse(Languages);
        if (!subCommand) {
            console.log(`===================
Installed languages
===================`);
            await this.listInstalledLanguages();
        }
        else if (subCommand === "install") {
            if (!(subCommandArg in LANGUAGES)) {
                console.error(`Invalid language ${subCommand}`);
                return;
            }
            const language = LANGUAGES[subCommandArg];
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const downloadUrl = (_a = language.source[process.platform]) === null || _a === void 0 ? void 0 : _a[process.arch];
            if (!downloadUrl) {
                console.error("No valid downloadable source for your OS and architecture, sorry!");
            }
            const languageDirectory = node_path_1.default.join(await (0, utils_1.getCLIDirectory)(), "servers");
            const languageServerPath = node_path_1.default.join(languageDirectory, `${subCommandArg}-server`);
            await (0, promises_1.mkdir)(languageDirectory, { recursive: true });
            console.log(`Downloading language server for ${subCommandArg}...`);
            await downloadAndUnzip(downloadUrl, languageServerPath);
            await (0, promises_3.chmod)(languageServerPath, 0o755);
            await addLanguageToServersFile({
                language: subCommandArg,
                serverType: language.serverType,
            });
            console.log(`Successfully installed language server for ${subCommandArg}`);
        }
    }
}
exports.default = Languages;
Languages.description = "sub-command for handling the different installed programming languages";
Languages.args = [{ name: "subCommand" }, { name: "subCommandArg" }];
/**
 * Downloads a file from url and unzips it
 * @param url
 * @param fileName
 */
async function downloadAndUnzip(url, fileName) {
    const response = await (0, node_fetch_1.default)(url);
    if (!response.ok)
        throw new Error(`Unexpected response ${response.statusText}`);
    const outputStream = (0, node_fs_1.createWriteStream)(fileName);
    const gunzip = (0, node_zlib_1.createGunzip)();
    await (0, promises_2.pipeline)(response.body, gunzip, outputStream);
}
async function addLanguageToServersFile(language) {
    const cliDirectory = await (0, utils_1.getCLIDirectory)();
    const serversPath = node_path_1.default.join(cliDirectory, "servers.json");
    const serversText = await (0, promises_1.readFile)(serversPath, "utf8");
    try {
        const servers = JSON.parse(serversText);
        servers.push(language);
        await (0, promises_1.writeFile)(serversPath, JSON.stringify(servers));
    }
    catch (error) {
        console.error(`Failed to read internal data: ${error}`);
        await (0, promises_1.writeFile)(serversPath, "[]");
    }
}
