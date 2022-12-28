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
  const ref = useRef<HTMLInputElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const submit = useSubmit();
  const params = useParams();

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      addGlobalKeyCommands(ref.current, submit);
      addGoBackKeyCommand(ref.current, submit, params.owner!, params.name!);
    }
  }, [ref]);

  useEffect(() => {
    if (textAreaRef.current) {
      addGlobalKeyCommands(textAreaRef.current, submit);
      addGoBackKeyCommand(
        textAreaRef.current,
        submit,
        params.owner!,
        params.name!
      );
    }
  }, [textAreaRef]);

  useHotkeys("Command+h", (e) => {
    e.preventDefault();
    submit(null, {
      method: "get",
      action: `/${params.owner}/${params.name}/issues`,
    });
  });

  return (
    <div className="w-1/2 max-w-3xl">
      <h1 className="text-2xl font-semibold">New Issue</h1>
      <div className="py-2">
        <KeyIcon>&#8984;H</KeyIcon>
        <span className="px-1">Go back</span>
      </div>
      <form className="flex flex-col space-y-6 p-4" method="post">
        <input name="title" type="text" placeholder="Title" ref={ref} />
        <textarea
          onKeyDown={(e) => {
            if (e.key === "enter" && e.metaKey) {
            }
          }}
          name="body"
          placeholder="Your description here"
          rows={8}
          ref={textAreaRef}
        />
        <button className="box w-40 py-3" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}
