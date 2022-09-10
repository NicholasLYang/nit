import client from "~/apollo-client";
import gql from "graphql-tag";
import { useLoaderData, useParams, useSubmit } from "@remix-run/react";
import { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
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
            author {
              login
            }
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
  useHotkeys("j", () => {
    window.scrollBy({ top: window.innerHeight, left: 0, behavior: "smooth" });
  });
  useHotkeys("k", () => {
    window.scrollBy({ top: -window.innerHeight, left: 0, behavior: "smooth" });
  });

  return (
    <div className="w-2/3 max-w-4xl grow">
      <div className="space-x-5">
        <span>
          <KeyIcon>h</KeyIcon> Go back
        </span>
        <span>
          <KeyIcon>j</KeyIcon> Scroll down
        </span>
        <span>
          <KeyIcon>k</KeyIcon> Scroll up
        </span>
      </div>
      <div className="pt-16">
        <h1
          className="prose text-3xl font-bold"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(issue.titleHTML) }}
        />
        <h2 className="text-lg">{issue.author.login}</h2>
      </div>
      <div
        className="prose w-full p-5"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(issue.bodyHTML) }}
      />
    </div>
  );
}
