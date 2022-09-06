import { useLoaderData, useParams } from "@remix-run/react";
import { gql } from "@apollo/client";
import client from "~/apollo-client";
import { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";

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

  console.log(installation.token);
  return {
    owner: params.owner,
    name: params.name,
    pullId: params.pullId,
    pullRequest: data.repository.pullRequest,
  };
}

export default function PullRequestPage() {
  const { owner, name, pullRequest, pullId } = useLoaderData();
  return (
    <div>
      <h1 className="text-xl">
        #{pullId}{" "}
        <span dangerouslySetInnerHTML={{ __html: pullRequest.titleHTML }} />
      </h1>
      <p
        className="max-w-xl"
        dangerouslySetInnerHTML={{ __html: pullRequest.bodyHTML }}
      />
    </div>
  );
}
