import { authenticator } from "~/auth.server";
import { Octokit } from "@octokit/rest";
import { useLoaderData } from "@remix-run/react";
import { LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const octokit = new Octokit({ auth: accessToken });
  return await octokit.rest.activity.listNotificationsForAuthenticatedUser();
}

export default function NotificationsPage() {
  const data = useLoaderData();
  console.log(data);
  return (
    <main>
      <h1>Notifications</h1>
    </main>
  );
}
