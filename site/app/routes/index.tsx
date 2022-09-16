import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { useEffect, useRef, useState } from "react";
import { useLoaderData, useSearchParams, useSubmit } from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";
import ActionButton from "~/components/ActionButton";
import KeyIcon from "~/components/KeyIcon";
import { getRandomRepository } from "~/utils";
import { getRecentlyVisitedRepositories } from "~/models/user.server";
import HomePageRepositories from "~/components/HomePageRepositories";
import client from "~/apollo-client";
import { gql } from "@apollo/client";
import { addGlobalKeyCommands } from "~/key-commands";

export async function action({ request }: ActionArgs) {
  const body = await request.formData();
  return redirect(`/${body.get("repository")}`);
}

export async function loader({ request }: LoaderArgs) {
  const { id, accessToken, profile } = await authenticator.isAuthenticated(
    request,
    {
      failureRedirect: "/login",
    }
  );

  const { data } = await client.query({
    query: gql`
      query PinnedRepositories {
        viewer {
          pinnedItems(first: 6) {
            nodes {
              ... on Repository {
                nameWithOwner
              }
            }
          }
        }
      }
    `,
    context: { headers: { Authorization: `bearer ${accessToken}` } },
  });

  const recentlyVisitedRepositories = await getRecentlyVisitedRepositories(id);

  return {
    randomRepository: getRandomRepository(),
    login: profile.displayName,
    recentlyVisitedRepositories,
    pinnedRepositories: data.viewer.pinnedItems.nodes.map(
      ({ nameWithOwner }) => nameWithOwner
    ),
  };
}

export default function Index() {
  const ref = useRef<HTMLInputElement>(null);
  const {
    login,
    randomRepository,
    recentlyVisitedRepositories,
    pinnedRepositories,
  } = useLoaderData();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();

  useHotkeys("m", () => {
    submit(null, { method: "get", action: `/${login}` });
  });

  useHotkeys("g", (event) => {
    event.preventDefault();
    setSearchParams({ state: "goto" });
  });

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      addGlobalKeyCommands(ref.current, submit);
    }
  }, [ref.current, searchParams]);

  return (
    <main>
      <div className="flex space-x-5 pt-5 pl-5">
        <ActionButton method="post" action="/logout">
          Log out <span className="text-slate-400">&#8984;B</span>
        </ActionButton>
        <ActionButton method="get" action="/feedback">
          Feedback <span className="text-slate-400">&#8984;U</span>
        </ActionButton>
      </div>
      <div className="flex h-screen items-center justify-center">
        <div className="mb-20 flex flex-col items-center text-center">
          <h1 className="py-4 text-2xl font-semibold">gitgot</h1>
          {searchParams.get("state") === "goto" ? (
            <div>
              <div className="flex flex-col items-start pb-5">
                <span>
                  <KeyIcon>&#8984;I</KeyIcon> Back
                </span>
              </div>
              <form className="flex" method="post" action="/?index">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  type="text"
                  ref={ref}
                  tabIndex={100}
                  name="repository"
                  id="repository"
                  placeholder={randomRepository}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  className="box m-2 disabled:bg-black disabled:text-white"
                  type="submit"
                >
                  ENTER
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="space-x-5">
                <span>
                  <KeyIcon>m</KeyIcon> My Repositories
                </span>
                <span>
                  <KeyIcon>g</KeyIcon> Go To Repository
                </span>
              </div>
              <HomePageRepositories
                recentlyVisited={recentlyVisitedRepositories}
                pinned={pinnedRepositories}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
