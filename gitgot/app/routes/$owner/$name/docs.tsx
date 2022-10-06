import { LoaderArgs } from "@remix-run/server-runtime";
import { getRepositoryDocumentation } from "~/models/repo.server";
import { authenticator } from "~/auth.server";
import { Link, useLoaderData, useParams, useSubmit } from "@remix-run/react";
import DocsList from "~/components/DocsList";
import { useHotkeys } from "react-hotkeys-hook";
import KeyIcon from "~/components/KeyIcon";

export async function loader({ params, request }: LoaderArgs) {
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return getRepositoryDocumentation(params.owner, params.name, accessToken);
}

export default function DocsPage() {
  const dependencies = useLoaderData();
  const submit = useSubmit();
  const { owner, name } = useParams();

  useHotkeys("h", () => {
    submit(null, { method: "get", action: `/${owner}/${name}` });
  });

  if (dependencies) {
    return (
      <div>
        <h1 className="pb-5 text-2xl font-semibold">Dependencies</h1>
        <Link to={`/${owner}/${name}`}>
          <KeyIcon>h</KeyIcon> Back to repo
        </Link>
        <DocsList items={dependencies} />
      </div>
    );
  }

  return <div>No dependencies found. We only support Rust currently.</div>;
}
