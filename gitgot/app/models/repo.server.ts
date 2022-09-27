import { Octokit } from "@octokit/rest";
import * as toml from "toml";
import { base64Decode } from "~/utils";

export async function addRepository(githubId: number, nameWithOwner: string) {}

export async function getRepositoryDocumentation(
  owner: string,
  name: string,
  accessToken: string
) {
  // Traverse repo using GitHub API looking for Cargo.toml, parse it and
  // take all the dependencies
  const octokit = new Octokit({ auth: accessToken });

  const { data: languages } = await octokit.rest.repos.listLanguages({
    owner,
    repo: name,
  });

  if ("Rust" in languages) {
    const res = await octokit.rest.repos.getContent({
      owner,
      repo: name,
      path: "Cargo.toml",
    });

    const cargoToml = toml.parse(base64Decode(res.data.content));
    return cargoToml.dependencies;
  }

  return null;
}
