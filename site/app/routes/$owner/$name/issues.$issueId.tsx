import client from "~/apollo-client";
import gql from "graphql-tag";
import { useLoaderData, useParams, useSubmit } from "@remix-run/react";
import { LoaderArgs, redirect } from "@remix-run/node";
import { authenticator, getInstallationToken } from "~/auth.server";
import sanitizeHtml from "sanitize-html";
import { useHotkeys } from "react-hotkeys-hook";
import KeyIcon from "~/components/KeyIcon";

export async function loader({ params, request }: LoaderArgs) {
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { data } = await client.query({
    query: gql`
      query Issue($owner: String!, $name: String!, $id: Int!) {
        repository(owner: $owner, name: $name) {
          issue(number: $id) {
            id
            bodyHTML
            number
            titleHTML
          }
        }
      }
    `,
    variables: {
      owner: params.owner,
      name: params.name,
      id: parseInt(params.issueId),
    },
    context: { headers: { Authorization: `token ${accessToken}` } },
  });

  return {
    issue: data.repository.issue,
  };
}

export default function IssuePage() {
  const { issue } = useLoaderData();
  const { owner, name } = useParams();
  const submit = useSubmit();

  useHotkeys("h", () => {
    submit(null, { method: "get", action: `/${owner}/${name}/issues` });
  });

  return (
    <div className="w-2/3 max-w-xl grow">
      <div>
        <span>
          <KeyIcon>h</KeyIcon> Go back
        </span>
      </div>
      <h1
        className="py-5 text-3xl font-bold"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(issue.titleHTML) }}
      />
      <div
        className="w-full p-5"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(issue.bodyHTML) }}
      />
    </div>
  );
}
