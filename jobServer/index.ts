/**
 * Job jobServer for nit. Responds to GitHub webhooks and issues jobs on fly.io
 *
 */
import "dotenv/config";
import Fastify from "fastify";
import { parseCommand } from "./parser";
import { expect } from "./utils";
import { createAppAuth } from "@octokit/auth-app";
//import { rename } from "../worker/src";
import { startRenameJob } from "./fly";

const jobServer = Fastify({ logger: true });

jobServer.get("/", () => {
  return { message: "Welcome to the nit API" };
});

interface Repository {
  full_name: string;
}

interface Comment {
  commit_id: string;
  body: string;
  position: number;
  path: string;
}

interface Installation {
  id: number;
}

interface PullRequestCommentPayload {
  action: string;
  comment: Comment;
  installation: Installation;
  sender: object;
  repository: Repository;
}

jobServer.post("/events/pull-request-comment", async (request, response) => {
  const { comment, repository, installation } =
    request.body as PullRequestCommentPayload;

  const command = parseCommand(comment.body);
  if (!command) {
    return;
  }

  const auth = createAppAuth({
    appId: expect(
      process.env.APP_ID,
      "Must provide APP_ID environment variable"
    ),
    privateKey: expect(
      process.env.PRIVATE_KEY,
      "Must provide PRIVATE_KEY environment variable"
    ),
    clientId: "Iv1.3c13e7dae6d4f091",
    clientSecret: expect(
      process.env.CLIENT_SECRET,
      "Must provide CLIENT_SECRET environment variable"
    ),
  });

  const installationAuth = await auth({
    type: "installation",
    installationId: installation.id,
  });

  return `https://x-access-token:${installationAuth.token}@github.com/${repository.full_name}.git`;
  // return startRenameJob(
  //   `https://x-access-token:${installationAuth.token}@github.com/${repository.full_name}.git`,
  //   comment.commit_id,
  //   command.oldName,
  //   command.newName,
  //   comment.position,
  //   comment.path
  // );
});

async function startServer() {
  try {
    await jobServer.listen({ port: 3000 });
  } catch (err) {
    jobServer.log.error(err);
    process.exit(1);
  }
}

startServer();
