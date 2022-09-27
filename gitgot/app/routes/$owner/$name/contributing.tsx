import { useLoaderData, useParams, useSubmit } from "@remix-run/react";
import RawHTMLContainer from "~/components/RawHTMLContainer";
import { useHotkeys } from "react-hotkeys-hook";
import { authenticator } from "~/auth.server";
import { LoaderArgs } from "@remix-run/node";
import { Octokit } from "@octokit/rest";
import { base64Decode } from "~/utils";
import { Converter } from "showdown";
import KeyIcon from "~/components/KeyIcon";

export async function loader({ request, params }: LoaderArgs) {
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const octokit = new Octokit({ auth: accessToken });

  const contributing = await octokit.rest.repos.getContent({
    owner: params.owner,
    repo: params.name,
    path: "CONTRIBUTING.md",
  });

  const contributingMarkdown = base64Decode(contributing.data.content || "");
  const converter = new Converter();

  return converter.makeHtml(contributingMarkdown);
}

export default function ContributingPage() {
  const contributing = useLoaderData();
  const params = useParams();
  const submit = useSubmit();

  useHotkeys("h", () => {
    submit(null, { method: "get", action: `/${params.owner}/${params.name}` });
  });
  useHotkeys("j", () => {
    window.scrollBy({ top: window.innerHeight, left: 0, behavior: "smooth" });
  });
  useHotkeys("k", () => {
    window.scrollBy({ top: -window.innerHeight, left: 0, behavior: "smooth" });
  });

  return (
    <>
      <div className="space-x-5 p-8">
        <span>
          <KeyIcon>h</KeyIcon> Go back
        </span>
        <span>
          <KeyIcon>j</KeyIcon> Scroll down
        </span>
        <span>
          <KeyIcon>k</KeyIcon> Scroll up
        </span>
      </div>
      <RawHTMLContainer
        className="bg-slate-200 py-10 px-20"
        html={contributing}
      />
    </>
  );
}
