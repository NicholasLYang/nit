import { gql } from "@apollo/client";
import {
  Outlet,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import client from "~/apollo-client";
import { useCallback, useEffect } from "react";

export async function loader({ params }) {
  const { data } = await client.query({
    query: gql`
      query Repository($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          issues(
            first: 20
            filterBy: { states: [OPEN] }
            orderBy: { field: CREATED_AT, direction: DESC }
          ) {
            nodes {
              id
              bodyHTML
              number
              title
            }
          }
        }
      }
    `,
    variables: { owner: params.owner, name: params.name },
  });
  return {
    owner: params.owner,
    name: params.name,
    issues: data.repository.issues.nodes,
  };
}

enum PageState {
  Home = "home",
  Issues = "issues",
}

export default function Repository() {
  const submit = useSubmit();
  const { owner, name, issues } = useLoaderData();

  const handleKeyPress = useCallback((event) => {
    switch (event.keyCode) {
      case 73: {
        // i
        submit(null, { method: "get", action: `/${owner}/${name}/issues` });
        break;
      }
    }
  }, []);

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <main className="flex h-screen flex-col items-center justify-between">
      <div className="flex grow items-center">
        <h1 className="pt-5">
          <span className="font-bold">{owner}</span> / {name}
        </h1>
      </div>
      <Outlet context={issues} />
    </main>
  );
}
