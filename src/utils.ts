import path from "node:path";
import { homedir } from "node:os";
import { access, mkdir } from "node:fs/promises";

export async function getCLIDirectory(): Promise<string> {
  const dirPath = path.join(homedir(), ".nit");

  try {
    await access(dirPath);
  } catch {
    await mkdir(dirPath);
  }

  return dirPath;
}

export enum Language {
  Rust = "rust",
}
