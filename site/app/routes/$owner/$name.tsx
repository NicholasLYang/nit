import { Outlet, useLoaderData, useSubmit } from "@remix-run/react";
import { LoaderArgs, redirect } from "@remix-run/node";
import { gql } from "@apollo/client";
import client from "~/apollo-client";
import { authenticator } from "~/auth.server";
import { Converter } from "showdown";
import ActionButton from "~/components/ActionButton";
import { useHotkeys } from "react-hotkeys-hook";

export async function loader({ params, request }: LoaderArgs) {
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { data } = await client.query({
    query: gql`
      query Repository($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          id
          name
          hasIssuesEnabled
          defaultBranchRef {
            name
          }
          issues(
            states: [OPEN]
            orderBy: { field: UPDATED_AT, direction: DESC }
            first: 20
          ) {
            nodes {
              id
              number
              titleHTML
              bodyHTML
            }
          }
          pullRequests(
            states: [OPEN]
            orderBy: { field: UPDATED_AT, direction: DESC }
            first: 20
          ) {
            nodes {
              id
              titleHTML
              bodyHTML
              number
            }
          }
          commitComments(first: 10) {
            nodes {
              author {
                avatarUrl
                login
              }
            }
          }
        }
      }
    `,
    context: { headers: { Authorization: `bearer ${accessToken}` } },
    variables: { owner: params.owner, name: params.name },
  });

  const defaultBranch = data.repository.defaultBranchRef.name;
  const readMeRequest = await fetch(
    `https://raw.githubusercontent.com/${params.owner}/${params.name}/${defaultBranch}/README.md`
  );

  let readMe;
  if (readMeRequest.status === 404) {
    readMe = "No README found";
  } else {
    const readMeMarkdown = await readMeRequest.text();
    const converter = new Converter();
    readMe = converter.makeHtml(readMeMarkdown);
  }

  return {
    id: data.repository.id,
    owner: params.owner,
    name: params.name,
    hasIssuesEnabled: data.repository.hasIssuesEnabled,
    issues: data.repository.issues.nodes,
    pullRequests: data.repository.pullRequests.nodes,
    readMe,
  };
}

export default function Repository() {
  const { id, owner, name, issues, pullRequests, readMe, hasIssuesEnabled } =
    useLoaderData();
  const submit = useSubmit();

  useHotkeys("command+i", () => {
    submit(null, { method: "get", action: "/" });
  });

  useHotkeys("command+b", () => {
    submit(null, { method: "post", action: "/logout" });
  });

  useHotkeys("command+u", () => {
    submit(null, { method: "post", action: "/feedback" });
  });

  useHotkeys("command+/", () => {
    window.location.href = `https://github.com${window.location.pathname}`;
  });

  return (
    <main className="flex h-screen flex-col items-center">
      <div className="flex flex-wrap space-x-7 self-start p-5">
        <ActionButton method="post" action="/logout">
          Go Home <span className="text-slate-400">&#8984;I</span>
        </ActionButton>
        <ActionButton method="post" action="/logout">
          Log out <span className="text-slate-400">&#8984;B</span>
        </ActionButton>
        <ActionButton method="get" action="/feedback">
          Feedback <span className="text-slate-400">&#8984;U</span>
        </ActionButton>
        <ActionButton method="post" action="/logout">
          Go To GitHub <span className="text-slate-400">&#8984;/</span>
        </ActionButton>
      </div>
      <div className="flex items-center p-5 pb-16">
        <h1 className="pt-5">
          <span className="font-bold">{owner}</span> / {name}
        </h1>
      </div>
      <Outlet
        context={{
          issues,
          pullRequests,
          readMe,
          hasIssuesEnabled,
          id,
        }}
      />
    </main>
  );
}
