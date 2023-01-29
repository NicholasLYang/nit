import { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import client from "~/apollo-client";
import { gql } from "@apollo/client";
import { logout } from "~/session.server";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";
import KeyIcon from "~/components/KeyIcon";
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
  useHotkeys(
    "n",
    () => {
      submit(null, { method: "get", action: `/${login}?after=${endCursor}` });
    },
    [endCursor]
  );
  useHotkeys(
    "b",
    () => {
      submit(null, {
        method: "get",
        action: `/${login}?before=${startCursor}`,
      });
    },
    [startCursor]
  );

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
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    },
    [repositories, selectedRepository]
  );

  return (
    <div className="flex w-full">
      <h1>
        Create <span className="text-bold">Secret</span> GitHub Issues
      </h1>
    </div>
  );
}
