import { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import client from "~/apollo-client";
import { gql } from "@apollo/client";
import { logout } from "~/session.server";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";
import KeyIcon from "~/components/KeyIcon";
import ItemsList from "~/components/ItemsList";
import { useCallback, useRef, useState } from "react";
import { classNames, isInViewport } from "~/utils";

export function ErrorBoundary({ error }) {
  return <div>{error}</div>;
}

export async function loader({ request, params }: LoaderArgs) {
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const url = new URL(request.url);
  const beforeCursor = url.searchParams.get("before");
  const afterCursor = url.searchParams.get("after");

  if (beforeCursor && afterCursor) {
    throw "Invalid URL. Cannot have both before and after query parameters";
  }

  try {
    const { data } = await client.query({
      query: gql`
        query User(
          $login: String!
          $beforeCursor: String
          $afterCursor: String
        ) {
          user(login: $login) {
            name
            login
            topRepositories(
              first: 30
              orderBy: { field: PUSHED_AT, direction: DESC }
              after: $afterCursor
              before: $beforeCursor
            ) {
              nodes {
                id
                name
                nameWithOwner
              }
              pageInfo {
                startCursor
                endCursor
              }
            }
          }
        }
      `,
      fetchPolicy: "no-cache",
      variables: { login: params.owner, beforeCursor, afterCursor },
      context: { headers: { Authorization: `token ${accessToken}` } },
    });

    return {
      name: data.user.name,
      login: params.owner,
      repositories: data.user.topRepositories.nodes,
      startCursor: data.user.topRepositories.pageInfo.startCursor,
      endCursor: data.user.topRepositories.pageInfo.endCursor,
    };
  } catch (e) {
    if (e?.networkError?.statusCode) {
      return logout(request);
    }

    throw e;
  }
}

export default function OwnerPage() {
  const { name, login, repositories, startCursor, endCursor } = useLoaderData();
  const submit = useSubmit();
  const [selectedRepository, setSelectedRepository] = useState(0);
  // We keep a hold of these two refs for when we need to scroll into view
  const nextSelectedRef = useRef(null);
  const previousSelectedRef = useRef(null);

  const getRef = useCallback(
    (i: number) => {
      if (i === (selectedRepository + 1) % repositories.length) {
        return nextSelectedRef;
      }
      if (
        i ===
        (selectedRepository + repositories.length - 1) % repositories.length
      ) {
        return previousSelectedRef;
      }
    },
    [nextSelectedRef, previousSelectedRef, selectedRepository]
  );

  useHotkeys("n", () => {
    submit(null, { method: "get", action: `/${login}?after=${endCursor}` });
  });
  useHotkeys("b", () => {
    submit(null, { method: "get", action: `/${login}?before=${startCursor}` });
  });
  useHotkeys("h", () => {
    submit(null, { method: "get", action: "/" });
  });

  useHotkeys(
    "j",
    () => {
      setSelectedRepository((repo) => (repo + 1) % repositories.length);
      if (nextSelectedRef.current) {
        nextSelectedRef.current.focus();

        if (!isInViewport(nextSelectedRef.current)) {
          nextSelectedRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    },
    [selectedRepository, repositories, setSelectedRepository]
  );
  useHotkeys(
    "k",
    () => {
      setSelectedRepository(
        (repo) => (repo - 1 + repositories.length) % repositories.length
      );
      if (previousSelectedRef.current) {
        previousSelectedRef.current.focus();
        if (!isInViewport(previousSelectedRef.current)) {
          previousSelectedRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    },
    [selectedRepository, repositories, setSelectedRepository]
  );

  useHotkeys(
    "enter",
    () => {
      const repo = repositories[selectedRepository];
      submit(null, { method: "get", action: `/${repo.nameWithOwner}` });
      window.scrollTo(0, 0);
    },
    [repositories, selectedRepository]
  );

  return (
    <div className="flex w-full flex-col items-center">
      <div className="py-2 text-center">
        <h1 className="text-2xl font-semibold">{name}</h1>
        <h2>{login}</h2>
      </div>
      <div className="space-x-5">
        <span>
          <KeyIcon>h</KeyIcon> Go home
        </span>
        <span>
          <KeyIcon>n</KeyIcon> Next page
        </span>
        <span>
          <KeyIcon>b</KeyIcon> Previous page
        </span>
      </div>
      <h2 className="pb-5 pt-10 text-xl font-semibold">Repositories</h2>
      <div className="space-x-5">
        <span>
          <KeyIcon>j</KeyIcon> Next repository
        </span>
        <span>
          <KeyIcon>k</KeyIcon> Previous repository
        </span>
        <span>
          <KeyIcon>ENTER</KeyIcon> Select repository
        </span>
      </div>
      <ul className="flex flex-col space-y-5 p-4">
        {repositories.map((repo, i) => (
          <li
            className={classNames(
              "border-2 border-slate-800 p-2 shadow-block",
              selectedRepository === i && "border-blue-400"
            )}
            key={repo.nameWithOwner}
            ref={getRef(i)}
          >
            <Link to={`/${repo.nameWithOwner}`}>
              <h3 className="text-lg">{repo.nameWithOwner}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
