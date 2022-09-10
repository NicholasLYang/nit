import { Form, useSubmit } from "@remix-run/react";
import * as React from "react";
import { authenticator } from "~/auth.server";
import { LoaderArgs } from "@remix-run/node";
import KeyIcon from "~/components/KeyIcon";
import { useHotkeys } from "react-hotkeys-hook";

export async function loader({ request }: LoaderArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export default function LoginPage() {
  const submit = useSubmit();
  useHotkeys("s", () => {
    submit(null, { method: "post", action: "/auth/github" });
  });

  return (
    <div className="flex h-screen flex-col items-center justify-center text-center">
      <div className="p-5">
        <h1 className="text-2xl font-bold">Welcome to gitgot</h1>
        <p className="max-w-sm">
          gitgot is a dialed-in GitHub user interfaces. It lets you use GitHub
          extremely quickly and efficiently.
        </p>
      </div>
      <Form method="post" action="/auth/github">
        <button>
          <KeyIcon>S</KeyIcon> Sign in
        </button>
      </Form>
    </div>
  );
}
