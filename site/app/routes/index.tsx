import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { useEffect, useRef, useState } from "react";
import { useLoaderData, useSubmit } from "@remix-run/react";
import client from "~/apollo-client";
import { gql } from "@apollo/client";
import ComboBox from "~/components/ComboBox";
import { logout } from "~/session.server";
import { useHotkeys } from "react-hotkeys-hook";
import ActionButton from "~/components/ActionButton";

/**
 * If there is just one installation, we show the top repositories for
 * that installation. Otherwise, we show the installations
 */
enum HomeDataType {
  Repositories,
  Installations,
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
      context: { headers: { Authorization: `token ${accessToken}` } },
    });

    const repositories = data.viewer.repositories.nodes;
    const randomIndex = Math.floor(Math.random() * repositories.length);

    return { repositories, randomIndex };
  } catch (e) {
    if (e.networkError.statusCode) {
      return logout(request);
    }

    throw e;
  }
}

export async function action({ request }: ActionArgs) {
  const params = await request.formData();
  return redirect("/" + params.get("repoName"));
}

export default function Index() {
  const [selectedItem, setSelectedItem] = useState<
    { nameWithOwner: string } | undefined
  >();

  const { repositories, randomIndex } = useLoaderData();
  const ref = useRef(null);
  const submit = useSubmit();

  useHotkeys("command+b", () => {
    submit(null, { method: "post", action: "/logout" });
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
          <h1 className="text-2xl font-semibold">gitgot</h1>
          <form method="get" action={`/${selectedItem?.nameWithOwner}`}>
            <ComboBox
              innerRef={ref}
              tabIndex={100}
              placeholder={repositories[randomIndex]?.name || "repository"}
              items={repositories}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
            <button
              disabled={selectedItem === undefined}
              className="hidden"
              type="submit"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
