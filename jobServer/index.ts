/**
 * Job jobServer for nit. Responds to GitHub webhooks and issues jobs on fly.io
 *
 */
import Fastify from "fastify";

const jobServer = Fastify({ logger: true });

jobServer.get("/", () => {
  return { messgae: "Welcome to the nit API" };
});

interface RunRequest {
  command: string;
  repository: string;
  commit: string;
}

jobServer.post("/run", (request, response) => {
  const { command, repository, commit } = request.body as RunRequest;
});

export async function startServer() {
  try {
    await jobServer.listen({ port: 3000 });
  } catch (err) {
    jobServer.log.error(err);
    process.exit(1);
  }
}
