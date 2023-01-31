import { useLoaderData, useParams } from "@remix-run/react";
import PullRequestOrIssuesList from "~/components/PullRequestOrIssuesList";
import KeyIcon from "~/components/KeyIcon";
import { ActionArgs } from "@remix-run/server-runtime";
import { LoaderArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import client from "~/apollo-client";
import { gql } from "@apollo/client";
import { decryptIssue } from "~/models/issue.server";
import { DecryptionStatus } from "~/types";
import { Link } from "react-router-dom";

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData();
  return redirect(
    `/${params.owner}/${params.name}/issues/${formData.get("issueNumber")}`
  );
}

export async function loader({ request, params }: LoaderArgs) {
  const { profile, accessToken, id } = await authenticator.isAuthenticated(
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
              title
              body
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

  const issues = await Promise.all(
    data.repository.issues.nodes.map(async (issue) => {
      const decryptedIssue = await decryptIssue({
        encryptedTitle: issue.title,
        encryptedBody: issue.body,
        number: issue.number,
        repositoryOwner: params.owner,
        repositoryName: params.name,
        userId: id,
      });
      if (decryptedIssue.status === DecryptionStatus.MySecret) {
        return {
          ...issue,
          isEncrypted: true,
          status: decryptedIssue.status,
          title: decryptedIssue.title,
          body: decryptedIssue.body,
        };
      } else {
        return { ...issue, status: decryptedIssue.status };
      }
    })
  );

  return {
    displayName: profile.displayName,
    issues,
  };
}

export default function IssuesIndex() {
  const { issues } = useLoaderData();
  const { owner, name } = useParams();

  return (
    <div className="w-2/3 max-w-4xl">
      <div className="flex items-center justify-between pt-5">
        <h1 className="text-xl font-bold">Issues</h1>
        <Link className="pr-5 text-2xl" to="new">
          +
        </Link>
      </div>
      <PullRequestOrIssuesList
        items={issues}
        itemName="issues"
        itemSlug="issues"
      />
    </div>
  );
}
