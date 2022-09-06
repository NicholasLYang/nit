import { Outlet, useLoaderData, useSubmit } from "@remix-run/react";
import { LoaderArgs, redirect } from "@remix-run/node";
import { gql } from "@apollo/client";
import client from "~/apollo-client";
import { getInstallationToken } from "~/auth.server";
import { useHotkeys } from "react-hotkeys-hook";

export async function loader({ params, request }: LoaderArgs) {
  const result = await getInstallationToken(request, params);
  // TODO: Display this error somewhere
  if (result.error) {
    return redirect("/", 401);
  }

  const token = result.token;

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
              id
              title
              number
            }
          }
        }
      }
    `,
    context: { headers: { Authorization: `token ${token}` } },
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

  useHotkeys("i", () => {
    submit(null, { method: "get", action: `/${owner}/${name}/issues` });
  });
  useHotkeys("h", () => {
    submit(null, { method: "get", action: "/" });
  });
  useHotkeys("p", () => {
    submit(null, { method: "get", action: `/${owner}/${name}/pulls` });
  });
  useHotkeys("s", () => {
    submit(null, { method: "get", action: `/${owner}/${name}/search` });
  });

  return (
    <main className="flex h-screen flex-col items-center">
      <div className="flex items-center p-5 pb-20">
        <h1 className="pt-5">
          <span className="font-bold">{owner}</span> / {name}
        </h1>
      </div>
      <Outlet context={{ issues, pullRequests }} />
    </main>
  );
}
