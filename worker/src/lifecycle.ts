import { $, cd, path } from "zx";
import { v4 as uuidv4 } from "uuid";
import { fileExists } from "./utils";
import { chmod, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { createWriteStream } from "node:fs";
import { createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";

const RUST_ANALYZER_DOWNLOAD_URLS = {
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
};

/**
 * Downloads a file from url and unzips it
 * @param url
 * @param fileName
 */
async function downloadAndUnzipFile(url: string, fileName: string) {
  const response = await fetch(url);

  if (!response.body || !response.ok)
    throw new Error(`Unexpected response ${response.statusText}`);

  const outputStream = createWriteStream(fileName);

  const gunzip = createGunzip();

  await pipeline(response.body, gunzip, outputStream);
}

async function downloadRustAnalyzer() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const downloadUrl =
    RUST_ANALYZER_DOWNLOAD_URLS[process.platform]?.[process.arch];

  if (!downloadUrl) {
    throw new Error(
      `No valid downloadable source for your OS (${process.platform}) and architecture (${process.arch}), sorry!`
    );
  }

  const rustAnalyzerPath = path.join(homedir(), "rust-analyzer");
  await downloadAndUnzipFile(downloadUrl, rustAnalyzerPath);
  await chmod(rustAnalyzerPath, 0o755);

  return rustAnalyzerPath;
}

async function cloneRepository(url: string, commit: string) {
  const repoPath = path.join(homedir(), "nit-repo");
  if (await fileExists(repoPath)) {
    await rm(repoPath, { recursive: true });
  }

  const branchName = `nit-${uuidv4()}`;
  await $`git clone ${url} ${repoPath}`;
  cd(repoPath);
  await $`git checkout ${commit}`;
  await $`git checkout -b ${branchName}`;
  await $`git config --global user.email "nit@nicholasyang.com"`;
  await $`git config --global user.name "nit"`;

  return { branchName, repoPath };
}

/**
 * Sets up the job by cloning repository and downloading Rust Analyzer
 * @param url
 * @param commit
 */
export async function setupJob(
  url: string,
  commit: string
): Promise<{ branchName: string; repoPath: string; rustAnalyzerPath: string }> {
  const [{ branchName, repoPath }, rustAnalyzerPath] = await Promise.all([
    cloneRepository(url, commit),
    downloadRustAnalyzer(),
  ]);

  return { branchName, repoPath, rustAnalyzerPath };
}

/**
 * Finish job
 */
export async function wrapUpJob(
  oldName: string,
  newName: string,
  branchName: string,
  repoPath: string
): Promise<void> {
  cd(repoPath);
  await $`git add .`;
  await $`git commit -m 'nit: Renamed ${oldName} to ${newName}'`;
  await $`git push -u origin ${branchName}`;
}
