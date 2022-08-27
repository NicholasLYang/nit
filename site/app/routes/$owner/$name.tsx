import { gql } from "@apollo/client";
import { useLoaderData } from "@remix-run/react";
import client from "~/apollo-client";
import { useCallback, useEffect, useState } from "react";
import RepositoryActionGrid from "~/components/RepositoryActionGrid";

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

enum PageState {
  Home,
  Issues
}

export default function Repository() {
  const [pageState, setPageState] = useState(PageState.Home);
  const { owner, name, issues } = useLoaderData();

  const handleKeyPress = useCallback((event) => {
    switch (event.keyCode) {
      case 73: { // i
        setPageState(PageState.Issues);
        break;
      }
      case 72: { // h
        setPageState(PageState.Home);
        break;
      }
    }
  }, []);

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [])

  let child;
  switch (pageState) {
    case PageState.Home: {
      child = <RepositoryActionGrid />
      break;
    }
    case PageState.Issues: {
      child = issues.map(issue => <ul><li>{issue.title}</li></ul>)
    }
  }

  return <main className="flex flex-col items-center justify-between h-screen">
    <div className="grow flex items-center"><h1><span className="font-bold">{owner}</span> / {name}</h1></div>
    {child}
  </main>
}
