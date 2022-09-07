import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { LoaderArgs, redirect } from "@remix-run/node";
import { gql } from "@apollo/client";
import client from "~/apollo-client";
import { getInstallationToken } from "~/auth.server";
import KeyIcon from "~/components/KeyIcon";

export async function loader({ params, request }: LoaderArgs) {
  const result = await getInstallationToken(request, params);

  if (result.logout) {
    return result.logout;
  }
  // TODO: Display this error somewhere
  if (result.error) {
    return redirect("/", 401);
  }

  const token = result.token;

  const { data } = await client.query({
    query: gql`
      query Repository($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          name
          defaultBranchRef {
            name
          }
          issues(first: 20) {
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
    context: { headers: { Authorization: `token ${token}` } },
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
    readMe = await readMeRequest.text();
  }

  return {
    owner: params.owner,
    name: params.name,
    issues: data.repository.issues.nodes,
    pullRequests: data.repository.pullRequests.nodes,
    readMe,
  };
}

export default function Repository() {
  const { owner, name, issues, pullRequests, readMe } = useLoaderData();
  const location = useLocation();

  return (
    <main className="flex h-screen flex-col items-center">
      <div className="flex flex-wrap space-x-7 self-start p-5">
        <a href={`https://github.com/${location.pathname}`}>
          <KeyIcon>g</KeyIcon> Go To GitHub
        </a>
        <Link to={`/feedback`}>
          <KeyIcon>f</KeyIcon> Feedback
        </Link>
      </div>
      <div className="flex items-center p-5 pb-16">
        <h1 className="pt-5">
          <span className="font-bold">{owner}</span> / {name}
        </h1>
      </div>
      <Outlet context={{ issues, pullRequests, readMe }} />
    </main>
  );
}
