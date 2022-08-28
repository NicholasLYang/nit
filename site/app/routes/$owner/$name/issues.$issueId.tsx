import client from "~/apollo-client";
import gql from "graphql-tag";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params }) {
  const { data } = await client.query({
    query: gql`
      query Issue($owner: String!, $name: String!, $id: Int!) {
        repository(owner: $owner, name: $name) {
          issue(number: $id) {
            id
            bodyHTML
            number
            title
          }
        }
      }
    `,
    variables: {
      owner: params.owner,
      name: params.name,
      id: parseInt(params.issueId),
    },
  });

  return {
    issue: data.repository.issue,
  };
}

export default function IssuePage() {
  const { issue } = useLoaderData();

  return (
    <div className="grow">
      <h1 className="p-3 text-xl">{issue.title}</h1>
      <div
        className="bg-slate-200 p-5"
        dangerouslySetInnerHTML={{ __html: issue.bodyHTML }}
      />
    </div>
  );
}
