import { $, cd, path } from "zx";
import { v4 as uuidv4 } from "uuid";
import { fileExists, uriToFile } from "./utils";
import { readFile, rm } from "node:fs/promises";
import { homedir } from "node:os";

/**
 * Sets up the job by cloning repository
 * @param url
 * @param commit
 */
export async function setupJob(
  url: string,
  commit: string
): Promise<{ branchName: string; repoPath: string }> {
  const repoPath = path.join(homedir(), "nit-repo");
  if (await fileExists(repoPath)) {
    await rm(repoPath, { recursive: true });
  }

  const branchName = `nit-${uuidv4()}`;
  await $`git clone ${url} ${repoPath}`;
  cd(repoPath);
  await $`git checkout -b ${branchName}`;

  return { branchName, repoPath };
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
  console.log(await $`git status`);
  const result = await $`git push -u origin ${branchName}`;
  console.log(result);
}
