export async function startRenameJob(
  repoUrl: string,
  commitHash: string,
  oldName: string,
  newName: string,
  lineNumber: number,
  filePath: string
) {
  const result = await fetch(
    `http://${process.env.FLY_API_HOSTNAME}/v1/apps/aecia/machines`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLY_TOKEN}`,
      },
      body: JSON.stringify({
        config: {
          image: "registry.fly.io/nit",
          env: {
            COMMAND: "rename",
            REPO_URL: repoUrl,
            COMMIT_HASH: commitHash,
            OLD_NAME: oldName,
            NEW_NAME: newName,
            LINE_NUMBER: lineNumber,
            FILE_PATH: filePath,
          },
        },
      }),
    }
  );

  return result.json();
}
