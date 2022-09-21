import {
  useLoaderData,
  useOutletContext,
  useParams,
  useSubmit,
} from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";
import PullRequestOrIssuesList from "~/components/PullRequestOrIssuesList";
import KeyIcon from "~/components/KeyIcon";
import { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import client from "~/apollo-client";
import { gql } from "@apollo/client";

export async function loader({ request, params }: LoaderArgs) {
  const { profile, accessToken } = await authenticator.isAuthenticated(
    request,
    {
      failureRedirect: "/login",
    }
  );

  const { data } = await client.query({
    query: gql`
      query Repository($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
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
              assignees(first: 10) {
                nodes {
                  login
                  avatarUrl
                }
              }
            }
          }
        }
      }
    `,
    context: { headers: { Authorization: `bearer ${accessToken}` } },
    variables: { owner: params.owner, name: params.name },
  });

  return {
    displayName: profile.displayName,
    pullRequests: data.repository.pullRequests.nodes,
  };
}

export default function PullRequests() {
  const { pullRequests } = useLoaderData();
  const params = useParams();
  const submit = useSubmit();

  useHotkeys("h", () => {
    submit(null, {
      method: "get",
      action: `/${params.owner}/${params.name}`,
    });
  });

  return (
    <div>
      <h1 className="p-2 text-3xl font-bold">Pull Requests</h1>
      <div className="space-x-5 p-4">
        <span>
          <KeyIcon>h</KeyIcon> Go back to repository
        </span>
        <span>
          <KeyIcon>n</KeyIcon> New Pull Request
        </span>
      </div>
      <PullRequestOrIssuesList
        items={pullRequests}
        itemName="pull requests"
        itemSlug="pulls"
      />
    </div>
  );
}
