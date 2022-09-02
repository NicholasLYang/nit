import { Outlet, useLoaderData, useSubmit } from "@remix-run/react";
import { useCallback, useEffect } from "react";
import { LoaderArgs } from "@remix-run/node";
import { gql } from "@apollo/client";
import client from "~/apollo-client";
import { authenticator } from "~/auth.server";
import { createAppAuth } from "@octokit/auth-app";
import { expect } from "~/utils";

export async function loader({ params, request }: LoaderArgs) {
  const { installations } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const auth = createAppAuth({
    appId: expect(process.env.APP_ID, "Expected APP_ID environment variable"),
    privateKey: expect(
      process.env.PRIVATE_KEY,
      "Expected PRIVATE_KEY environment variable"
    ),
    clientId: expect(
      process.env.CLIENT_ID,
      "Expected CLIENT_ID environment variable"
    ),
    clientSecret: expect(
      process.env.CLIENT_SECRET,
      "Expected CLIENT_SECRET environment variable"
    ),
  });
  const installationAuth = await auth({
    type: "installation",
    installationId: installations[0].id,
  });
  console.log(installationAuth.token);
  const { data } = await client.query({
    query: gql`
      query Repository($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          issues(first: 20) {
            nodes {
              title
            }
          }
          pullRequests(
            states: [OPEN]
            orderBy: { field: UPDATED_AT, direction: DESC }
            first: 20
          ) {
            nodes {
              title
            }
          }
        }
      }
    `,
    context: { headers: { Authorization: `token ${installationAuth.token}` } },
    variables: { owner: params.owner, name: params.name },
  });

  return {
    owner: params.owner,
    name: params.name,
    issues: data.repository.issues.nodes,
    pullRequests: data.repository.pullRequests.nodes,
  };
}

export default function Repository() {
  const submit = useSubmit();
  const { owner, name, issues, pullRequests } = useLoaderData();

  const handleKeyPress = useCallback((event) => {
    switch (event.keyCode) {
      case 73: {
        // i
        submit(null, { method: "get", action: `/${owner}/${name}/issues` });
        break;
      }
      case 72: {
        // h
        submit(null, { method: "get", action: `/` });
        break;
      }
      case 80: {
        // p
        submit(null, { method: "get", action: `/${owner}/${name}/pulls` });
        break;
      }
    }
  }, []);

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <main className="flex h-screen flex-col items-center justify-between">
      <div className="flex items-center p-5 pb-20">
        <h1 className="pt-5">
          <span className="font-bold">{owner}</span> / {name}
        </h1>
      </div>
      <Outlet context={{ issues, pullRequests }} />
    </main>
  );
}
