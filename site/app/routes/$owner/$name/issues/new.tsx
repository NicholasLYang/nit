import { ActionArgs, redirect } from "@remix-run/node";
import { useEffect, useRef } from "react";
import { authenticator } from "~/auth.server";
import { useOutletContext } from "@remix-run/react";
import client from "~/apollo-client";
import { gql } from "@apollo/client";

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");
  const repositoryId = formData.get("repositoryId");

  console.log(repositoryId);
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { data } = await client.mutate({
    mutation: gql`
      mutation CreateIssue(
        $title: String!
        $body: String!
        $repositoryId: ID!
      ) {
        createIssue(
          input: { title: $title, body: $body, repositoryId: $repositoryId }
        ) {
          issue {
            id
            number
          }
        }
      }
    `,
    variables: {
      title,
      body,
      repositoryId,
    },
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return redirect(
    `/${params.owner}/${params.name}/issues/${data.createIssue.issue.number}`
  );
}

export default function NewIssue() {
  const ref = useRef(null);
  const context = useOutletContext();
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, [ref]);

  return (
    <div className="w-1/2 max-w-3xl">
      <h1 className="text-2xl font-semibold">New Issue</h1>
      <form className="flex flex-col space-y-6 p-4" method="post">
        <input name="title" type="text" placeholder="Title" ref={ref} />
        <textarea name="body" placeholder="Your description here" />
        <input
          name="repositoryId"
          type="text"
          className="hidden"
          readOnly
          value={context.id}
        />
        <button className="box w-16" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}
