import { Outlet, useLoaderData, useSubmit } from "@remix-run/react";
import { LoaderArgs } from "@remix-run/node";
import { gql } from "@apollo/client";
import client from "~/apollo-client";
import { authenticator } from "~/auth.server";
import { Converter } from "showdown";
import ActionButton from "~/components/ActionButton";
import { Issue, PullRequest } from "~/types";
import { addVisitedRepository } from "~/models/user.server";

export interface ContextType {
  issues: Issue[];
  pullRequests: PullRequest[];
  readMe: string;
  hasIssuesEnabled: boolean;
  id: string;
  contributing: string | undefined;
}

export async function loader({ params, request }: LoaderArgs) {
  const { id, accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  await addVisitedRepository(id, `${params.owner}/${params.name}`);

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
  const [readMeRequest, contributingRequest] = await Promise.all([
    fetch(
      `https://raw.githubusercontent.com/${params.owner}/${params.name}/${defaultBranch}/README.md`
    ),
    fetch(
      `https://raw.githubusercontent.com/${params.owner}/${params.name}/${defaultBranch}/CONTRIBUTING.md`
    ),
  ]);

  const converter = new Converter();

  let contributing;
  if (contributingRequest.status !== 404) {
    const contributingMarkdown = await contributingRequest.text();
    contributing = converter.makeHtml(contributingMarkdown);
  }

  let readMe;
  if (readMeRequest.status === 404) {
    readMe = "No README found";
  } else {
    const readMeMarkdown = await readMeRequest.text();
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
    contributing,
  };
}

export default function Repository() {
  const {
    id,
    owner,
    name,
    issues,
    pullRequests,
    readMe,
    hasIssuesEnabled,
    contributing,
  } = useLoaderData();

  const context: ContextType = {
    issues,
    pullRequests,
    readMe,
    hasIssuesEnabled,
    id,
    contributing,
  };

  return (
    <main className="flex flex-col items-center pb-10">
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
      <div className="flex items-center p-5">
        <h1 className="pt-5">
          <span className="font-bold">{owner}</span> / {name}
        </h1>
      </div>
      <Outlet context={context} />
    </main>
  );
}
