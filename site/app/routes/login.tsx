import { Form, Link, useSubmit } from "@remix-run/react";
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
    <div className="flex flex-col items-center justify-center">
      <div className="max-w-sm py-10">
        <h1 className="py-3 text-2xl font-bold">Welcome to gitgot</h1>
        <p>
          gitgot is a dialed-in GitHub user interfaces. It lets you use GitHub
          extremely quickly and efficiently.
        </p>
        <p className="py-5">
          If you're new to gitgot,{" "}
          <Link className="text-blue-600 visited:text-purple-600" to="/help">
            click here
          </Link>{" "}
          for a tutorial
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
