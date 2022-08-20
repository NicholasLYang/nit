import { rename } from "./commands/rename";
import { expect } from "./utils";

async function main() {
  switch (process.env.COMMAND) {
    case "rename": {
      await rename({
        repoUrl: expect(
          process.env.REPO_URL,
          "REPO_URL environment variable expected"
        ),
        commitHash: expect(
          process.env.COMMIT_HASH,
          "COMMIT_HASH environment variable expected"
        ),
        oldName: expect(
          process.env.OLD_NAME,
          "OLD_NAME environment variable expected"
        ),
        newName: expect(
          process.env.NEW_NAME,
          "NEW_NAME environment variable expected"
        ),
        lineNumber: expect(
          process.env.LINE_NUMBER,
          "LINE_NUMBER environment variable expected"
        ),
        file: expect(
          process.env.FILE_PATH,
          "FILE_PATH environment variable expected"
        ),
        language: process.env.LANGUAGE,
      });
      return;
    }

    default:
      if (process.env.COMMAND) {
        console.log(`Unknown command: ${process.env.COMMAND}`);
      } else {
        console.log(
          "No command given. Please pass one in via the COMMAND environment variable"
        );
      }
  }
}

main();
