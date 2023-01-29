import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { getRandomRepository } from "~/utils";
import { getRecentlyVisitedRepositories } from "~/models/user.server";
import client from "~/apollo-client";
import { gql } from "@apollo/client";
import { Form } from "@remix-run/react";

export async function action({ request }: ActionArgs) {
  const body = await request.formData();
  const repo = body.get("repository");
  if (repo === null || !repo.includes("/")) {
    return;
  }
  return redirect(`/${repo}/issues`);
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
  return (
    <div className="flex items-center py-20 px-24">
      <Form method="post">
        <h1 className="py-2 text-lg">Enter repository</h1>
        <span className="space-x-2">
          <input
            name="repository"
            pattern="[\w-]+/[\w-]+"
            className="rounded p-2 text-lg"
            placeholder="owner/repo"
          />
          <button className="inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Go
          </button>
        </span>
      </Form>
    </div>
  );
}
