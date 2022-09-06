import { useLoaderData, useSubmit } from "@remix-run/react";
import { gql } from "@apollo/client";
import client from "~/apollo-client";
import { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { useHotkeys } from "react-hotkeys-hook";
import KeyIcon from "~/components/KeyIcon";
import sanitizeHtml from "sanitize-html";

export async function loader({ params, request }: LoaderArgs) {
  const { installations } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const installation = installations.find(
    (i) => i.account.login === params.owner
  );

  const { data } = await client.query({
    query: gql`
      query Repository($owner: String!, $name: String!, $number: Int!) {
        repository(owner: $owner, name: $name) {
          pullRequest(number: $number) {
            titleHTML
            bodyHTML
            state
            author {
              avatarUrl
              login
            }
          }
        }
      }
    `,
    context: { headers: { Authorization: `token ${installation.token}` } },
    variables: {
      owner: params.owner,
      name: params.name,
      number: parseInt(params.pullId),
    },
  });

  return {
    owner: params.owner,
    name: params.name,
    pullId: params.pullId,
    pullRequest: data.repository.pullRequest,
  };
}

export default function PullRequestPage() {
  const { owner, name, pullRequest, pullId } = useLoaderData();
  const submit = useSubmit();

  useHotkeys("b", () => {
    submit(null, { method: "get", action: `/${owner}/${name}/pulls` });
  });

  return (
    <div>
      <div className="space-x-7 pb-10">
        <span>
          <KeyIcon>b</KeyIcon> Go back
        </span>
      </div>
      <h1 className="text-2xl font-semibold">
        #{pullId}{" "}
        <span
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(pullRequest.titleHTML),
          }}
        />
      </h1>
      {pullRequest.bodyHTML === "" && (
        <p className="py-6 italic">No description provided.</p>
      )}
      <p
        className="max-w-xl"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(pullRequest.bodyHTML) }}
      />
    </div>
  );
}
