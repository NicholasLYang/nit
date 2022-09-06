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
    <div className="flex h-screen flex-col items-center justify-center">
      <Form method="post" action="/auth/github">
        <button>
          <KeyIcon>S</KeyIcon>ign In
        </button>
      </Form>
    </div>
  );
}
