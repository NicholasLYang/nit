import { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import client from "~/apollo-client";
import { gql } from "@apollo/client";
import { logout } from "~/session.server";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";
import KeyIcon from "~/components/KeyIcon";

export function ErrorBoundary({ error }) {
  return <div>{error}</div>;
}

export async function loader({ request, params }: LoaderArgs) {
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const url = new URL(request.url);
  const beforeCursor = url.searchParams.get("before");
  const afterCursor = url.searchParams.get("after");

  if (beforeCursor && afterCursor) {
    throw "Invalid URL. Cannot have both before and after query parameters";
  }

  try {
    const { data } = await client.query({
      query: gql`
        query User(
          $login: String!
          $beforeCursor: String
          $afterCursor: String
        ) {
          user(login: $login) {
            name
            login
            topRepositories(
              first: 30
              orderBy: { field: PUSHED_AT, direction: DESC }
              after: $afterCursor
              before: $beforeCursor
            ) {
              nodes {
                id
                name
                nameWithOwner
              }
              pageInfo {
                startCursor
                endCursor
              }
            }
          }
        }
      `,
      fetchPolicy: "no-cache",
      variables: { login: params.owner, beforeCursor, afterCursor },
      context: { headers: { Authorization: `token ${accessToken}` } },
    });

    return {
      name: data.user.name,
      login: params.owner,
      repositories: data.user.topRepositories.nodes,
      startCursor: data.user.topRepositories.pageInfo.startCursor,
      endCursor: data.user.topRepositories.pageInfo.endCursor,
    };
  } catch (e) {
    if (e?.networkError?.statusCode) {
      return logout(request);
    }

    throw e;
  }
}

export default function OwnerPage() {
  const { name, login, repositories, startCursor, endCursor } = useLoaderData();
  const submit = useSubmit();

  useHotkeys("n", () => {
    submit(null, { method: "get", action: `/${login}?after=${endCursor}` });
  });
  useHotkeys("b", () => {
    submit(null, { method: "get", action: `/${login}?before=${startCursor}` });
  });

  return (
    <div className="flex w-2/3 max-w-3xl flex-col items-center">
      <div className="py-2">
        <h1 className="text-2xl font-semibold">{name}</h1>
        <h2>{login}</h2>
      </div>
      <div className="space-x-5">
        <span>
          <KeyIcon>n</KeyIcon> Next page
        </span>
        <span>
          <KeyIcon>b</KeyIcon> Previous page
        </span>
      </div>
      <ul className="p-4">
        {repositories.map((repo) => (
          <li key={repo.nameWithOwner}>
            <h3>{repo.nameWithOwner}</h3>
          </li>
        ))}
      </ul>
    </div>
  );
}
