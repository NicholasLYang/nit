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

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function uriToFile(uri: string): string {
  return uri.slice(7);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function expect<T>(value: T | undefined | null, message: string): T {
  if (!value) {
    throw new TypeError(message);
  }
  return value;
}
