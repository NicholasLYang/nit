import { gql } from "@apollo/client";
import client from "~/apollo-client";
import { authenticator } from "~/auth.server";
import { LoaderArgs } from "@remix-run/node";
import {
  useLoaderData,
  useParams,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";
import { GoToIssueForm } from "~/components/GoToIssueForm";
import KeyIcon from "~/components/KeyIcon";
import PullRequestOrIssuesList from "~/components/PullRequestOrIssuesList";

export async function loader({ request, params }: LoaderArgs) {
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { data } = await client.query({
    query: gql`
      query Repository($owner: String!, $name: String!, $user: String!) {
        repository(owner: $owner, name: $name) {
          issues(
            states: [OPEN]
            orderBy: { field: UPDATED_AT, direction: DESC }
            filterBy: { assignee: $user }
            first: 20
          ) {
            nodes {
              id
              number
              titleHTML
              bodyHTML
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
    variables: { owner: params.owner, name: params.name, user: params.user },
  });

  return {
    user: params.user,
    issues: data.repository.issues.nodes,
  };
}

export default function AssigneeIssues() {
  const { owner, name } = useParams();
  const { user, issues } = useLoaderData();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();

  useHotkeys("h", () => {
    submit(null, {
      method: "get",
      action: `/${owner}/${name}/issues`,
    });
  });

  useHotkeys("n", () => {
    submit(null, {
      method: "get",
      action: `/${owner}/${name}/issues/new`,
    });
  });

  useHotkeys("g", () => {
    setSearchParams({ state: "goto" });
  });

  if (searchParams.get("state") === "goto") {
    return <GoToIssueForm />;
  }

  return (
    <div className="w-2/3 max-w-4xl">
      <h1 className="py-5 text-3xl font-bold">Issues for {user}</h1>
      <div className="space-x-5 py-2">
        <span>
          <KeyIcon>h</KeyIcon> Go back to issues
        </span>
        <span>
          <KeyIcon>n</KeyIcon> New issue
        </span>
        <span>
          <KeyIcon>g</KeyIcon> Go to issue
        </span>
      </div>
      <PullRequestOrIssuesList
        items={issues}
        itemName="issues"
        itemSlug="issues"
      />
    </div>
  );
}
