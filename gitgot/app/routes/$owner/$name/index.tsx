import { Link, useLoaderData, useParams, useSubmit } from "@remix-run/react";
import KeyIcon from "~/components/KeyIcon";
import { useHotkeys } from "react-hotkeys-hook";
import { gql } from "@apollo/client";
import client from "~/apollo-client";
import { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { Converter } from "showdown";
import { Octokit } from "@octokit/rest";
import { base64Decode } from "~/utils";

export async function loader({ params, request }: LoaderArgs) {
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { data } = await client.query({
    query: gql`
      query Repository($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          id
          name
          hasIssuesEnabled
        }
      }
    `,
    context: { headers: { Authorization: `bearer ${accessToken}` } },
    variables: { owner: params.owner, name: params.name },
  });
  const octokit = new Octokit({ auth: accessToken });

  const [readMeRequest, contributingRequest] = await Promise.allSettled([
    octokit.rest.repos.getReadme({
      owner: params.owner,
      repo: params.name,
    }),
    octokit.rest.repos.getContent({
      owner: params.owner,
      repo: params.name,
      path: "CONTRIBUTING.md",
    }),
  ]);

  const converter = new Converter();

  let readMe;
  if (readMeRequest.status === "fulfilled") {
    const readMeMarkdown = base64Decode(readMeRequest.value.data.content || "");
    readMe = converter.makeHtml(readMeMarkdown);
  } else {
    readMe = "No README for repository";
  }

  let hasContributing = contributingRequest.status === "fulfilled";

  return {
    hasIssuesEnabled: data.repository.hasIssuesEnabled,
    readMe,
    hasContributing,
  };
}

export default function Index() {
  const { owner, name } = useParams();
  const { readMe, hasIssuesEnabled, hasContributing } = useLoaderData();
  const submit = useSubmit();

  useHotkeys("i", () => {
    if (hasIssuesEnabled) {
      submit(null, { method: "get", action: `/${owner}/${name}/issues` });
    }
  });
  useHotkeys("h", () => {
    submit(null, { method: "get", action: "/" });
  });
  useHotkeys("p", () => {
    submit(null, { method: "get", action: `/${owner}/${name}/pulls` });
  });
  useHotkeys("s", () => {
    submit(null, { method: "get", action: `/${owner}/${name}/search` });
  });
  useHotkeys("c", () => {
    if (hasContributing) {
      submit(null, { method: "get", action: `/${owner}/${name}/contributing` });
    }
  });
  useHotkeys("j", () => {
    window.scrollBy({ top: window.innerHeight, left: 0, behavior: "smooth" });
  });
  useHotkeys("k", () => {
    window.scrollBy({ top: -window.innerHeight, left: 0, behavior: "smooth" });
  });

  return (
    <>
      <div className="flex flex-wrap space-x-7 pb-5">
        <Link to={"/"}>
          <KeyIcon>h</KeyIcon> Home
        </Link>
        {hasIssuesEnabled && (
          <Link to={`/${owner}/${name}/issues`}>
            <KeyIcon>i</KeyIcon> Issues
          </Link>
        )}
        <Link to={`/${owner}/${name}/pulls`}>
          <KeyIcon>p</KeyIcon> Pull requests
        </Link>
        {hasContributing && (
          <Link to={`/${owner}/${name}/pulls`}>
            <KeyIcon>c</KeyIcon> Contributing
          </Link>
        )}
      </div>
      <div className="space-x-5 pt-8">
        <span>
          <KeyIcon>j</KeyIcon> Scroll down
        </span>
        <span>
          <KeyIcon>k</KeyIcon> Scroll up
        </span>
      </div>
      <div
        className="prose mt-10 bg-slate-200 py-10 px-20 prose-img:my-1"
        dangerouslySetInnerHTML={{ __html: readMe }}
      />
    </>
  );
}
