import { gql } from "@apollo/client";
import { useLoaderData } from "@remix-run/react";
import client from "~/apollo-client";

export async function loader({ params }) {
  const { data } = await client.query({
    query: gql`
      query Repository {
        repository(owner: "facebook", name: "react") {
          issues(first: 20) {
            nodes {
              id
              title
            }
          }
        }
      }
    `,
  });

  return { owner: params.owner, name: params.name, issues: data.repository.issues.nodes }
}

export default function Repository() {
  const { owner, name, issues } = useLoaderData();
  return <main className="grid place-items-center">
    <h1>{owner} / {name}</h1>
    <ul>{issues.map(issue => <li>{issue.title}</li>)}</ul>
  </main>
}
