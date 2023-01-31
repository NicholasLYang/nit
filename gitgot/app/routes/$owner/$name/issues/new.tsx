import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { useEffect, useRef } from "react";
import { authenticator } from "~/auth.server";
import { SubmitFunction, useParams, useSubmit } from "@remix-run/react";

import KeyIcon from "~/components/KeyIcon";
import { addGlobalKeyCommands } from "~/key-commands";
import { useHotkeys } from "react-hotkeys-hook";
import {
  createIssue,
  encryptIssue,
  uploadIssueToGitHub,
} from "~/models/issue.server";

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

  const { accessToken, id: userId } = await authenticator.isAuthenticated(
    request,
    {
      failureRedirect: "/login",
    }
  );

  const { encryptedTitle, encryptedBody, key, iv } = await encryptIssue({
    title,
    body,
  });

  const { issueNumber } = await uploadIssueToGitHub({
    accessToken,
    repositoryOwner: params.owner,
    repositoryName: params.name,
    encryptedTitle,
    encryptedBody,
  });

  await createIssue({
    repositoryName: params.name,
    repositoryOwner: params.owner,
    number: issueNumber,
    userId,
    iv,
    key,
  });

  return redirect(`/${params.owner}/${params.name}/issues/${issueNumber}`);
}

function addGoBackKeyCommand(
  element: HTMLElement,
  submit: SubmitFunction,
  owner: string,
  name: string
) {
  element.addEventListener("keydown", (event) => {
    if (event.metaKey && event.key === "h") {
      event.preventDefault();
      submit(null, {
        method: "get",
        action: `/${owner}/${name}/issues`,
      });
    }
  });
}

export default function NewIssue() {
  return (
    <div className="w-3/4 max-w-2xl pt-10">
      <h1 className="text-xl font-semibold">New Issue</h1>
      <form className="flex flex-col space-y-6 p-4" method="post">
        <input name="title" type="text" placeholder="Title" />
        <textarea
          onKeyDown={(e) => {
            if (e.key === "enter" && e.metaKey) {
            }
          }}
          name="body"
          placeholder="Your description here"
          rows={8}
        />
        <button className="box w-24 bg-white py-3" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}
