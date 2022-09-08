import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { useEffect, useRef } from "react";
import { useSubmit } from "@remix-run/react";
import client from "~/apollo-client";
import { gql } from "@apollo/client";
import { logout } from "~/session.server";
import { useHotkeys } from "react-hotkeys-hook";
import ActionButton from "~/components/ActionButton";

export async function action({ request }: ActionArgs) {
  const body = await request.formData();
  return redirect(`/${body.get("repository")}`);
}

export async function loader({ request }: LoaderArgs) {
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  try {
    const { data } = await client.query({
      query: gql`
        query TopInstallationRepos {
          viewer {
            repositories(
              first: 20
              orderBy: { field: PUSHED_AT, direction: DESC }
              affiliations: [OWNER]
            ) {
              nodes {
                id
                name
                nameWithOwner
              }
            }
          }
        }
      `,
      fetchPolicy: "no-cache",
      context: { headers: { Authorization: `token ${accessToken}` } },
    });

    const repositories = data.viewer.repositories.nodes;
    const randomIndex = Math.floor(Math.random() * repositories.length);
    return { repositories, randomIndex };
  } catch (e) {
    console.error(e);
    if (e.networkError.statusCode) {
      return logout(request);
    }

    throw e;
  }
}

export default function Index() {
  const ref = useRef(null);
  const submit = useSubmit();

  useHotkeys("command+b", () => {
    submit(null, { method: "post", action: "/" });
  });

  useHotkeys("command+u", () => {
    submit(null, { method: "get", action: "/feedback" });
  });

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();

      const onKeydown = (event) => {
        if (event.metaKey && event.key === "b") {
          submit(null, { method: "post", action: "/logout" });
        }
        if (event.metaKey && event.key === "u") {
          submit(null, { method: "get", action: "/feedback" });
        }
      };

      ref.current.addEventListener("keydown", onKeydown);
    }
  }, [ref]);

  return (
    <main>
      <div className="flex">
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
              placeholder="facebook/react"
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
      </div>
    </main>
  );
}
