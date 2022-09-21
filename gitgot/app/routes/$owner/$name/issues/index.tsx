import {
  useLoaderData,
  useParams,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";
import PullRequestOrIssuesList from "~/components/PullRequestOrIssuesList";
import KeyIcon from "~/components/KeyIcon";
import { ActionArgs } from "@remix-run/server-runtime";
import { LoaderArgs, redirect } from "@remix-run/node";
import { GoToIssueForm } from "~/components/GoToIssueForm";
import { authenticator } from "~/auth.server";
import client from "~/apollo-client";
import { gql } from "@apollo/client";

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData();
  return redirect(
    `/${params.owner}/${params.name}/issues/${formData.get("issueNumber")}`
  );
}

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
    issues: data.repository.issues.nodes,
  };
}

export default function IssuesIndex() {
  const { owner, name } = useParams();
  const { displayName, issues } = useLoaderData();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();

  useHotkeys("h", () => {
    submit(null, {
      method: "get",
      action: `/${owner}/${name}`,
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

  useHotkeys("m", () => {
    submit(null, {
      method: "get",
      action: `/${owner}/${name}/issues/assigned/${displayName}`,
    });
  });

  if (searchParams.get("state") === "goto") {
    return <GoToIssueForm />;
  }

  return (
    <div className="w-2/3 max-w-4xl">
      <h1 className="py-5 text-3xl font-bold">Issues</h1>
      <div className="space-x-5 py-2">
        <span>
          <KeyIcon>h</KeyIcon> Go back to repository
        </span>
        <span>
          <KeyIcon>n</KeyIcon> New issue
        </span>
        <span>
          <KeyIcon>g</KeyIcon> Go to issue
        </span>
        <span>
          <KeyIcon>m</KeyIcon> Go to assigned issues
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
