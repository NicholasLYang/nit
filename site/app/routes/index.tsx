import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLoaderData, useSubmit } from "@remix-run/react";
import client from "~/apollo-client";
import { gql } from "@apollo/client";
import ComboBox from "~/components/ComboBox";

/**
 * If there is just one installation, we show the top repositories for
 * that installation. Otherwise, we show the installations
 */
enum HomeDataType {
  Repositories,
  Installations,
}

function getRandomRepository(repositories: object[]) {
  return repositories[Math.floor(Math.random() * repositories.length)];
}

export async function loader({ request }: LoaderArgs) {
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

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
  return data.viewer.repositories.nodes;
}

export async function action({ request }: ActionArgs) {
  const params = await request.formData();
  return redirect("/" + params.get("repoName"));
}

export default function Index() {
  const [selectedItem, setSelectedItem] = useState<string | undefined>();
  const submit = useSubmit();
  const repositories = useLoaderData();
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, [ref]);

  const handleSubmit = useCallback(() => {
    submit(null, { method: "get", action: `/${selectedItem.nameWithOwner}` });
  }, [selectedItem, submit]);

  return (
    <main>
      <form className="ml-10" method="post" action="/logout">
        <button
          type="submit"
          className="mt-5 flex items-center justify-center rounded-lg border p-5 shadow"
        >
          Log out
        </button>
      </form>
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl">GitFocus</h1>
          <form onSubmit={handleSubmit}>
            <ComboBox
              innerRef={ref}
              tabIndex={100}
              placeholder={getRandomRepository(repositories).name}
              items={repositories}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </main>
  );
}
