import { LoaderArgs } from "@remix-run/server-runtime";
import { getRepositoryDocumentation } from "~/models/repo.server";
import { authenticator } from "~/auth.server";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params, request }: LoaderArgs) {
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return getRepositoryDocumentation(params.owner, params.name, accessToken);
}

export default function DocsPage() {
  const dependencies = useLoaderData();

  if (dependencies) {
    return (
      <ul>
        {Object.entries(dependencies).map(([depName, depVersion]) => (
          <li>
            <a href={`https://docs.rs/${depName}/${depVersion}/${depName}`}>
              {depName}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return <div>No dependencies found. We only support Rust currently.</div>;
}
