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

export function getLineOffset(text: string, lineNumber: number) {
  for (let i = 0; i < text.length; i++) {
    if (lineNumber === 0) {
      return i;
    }

    if (text[i] === "\n") {
      lineNumber -= 1;
    }
  }

  if (lineNumber === 0) {
    return text.length - 1;
  } else {
    throw new Error("Invalid line number: " + lineNumber);
  }
}
