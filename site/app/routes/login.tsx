import { Form, useSubmit } from "@remix-run/react";
import * as React from "react";
import { authenticator } from "~/auth.server";
import { LoaderArgs } from "@remix-run/node";
import { useKeyPress } from "~/utils";
import { useEffect } from "react";
import KeyIcon from "~/components/KeyIcon";

export async function loader({ request }: LoaderArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export default function LoginPage() {
  const signinPress = useKeyPress("s");
  const submit = useSubmit();

  useEffect(() => {
    if (signinPress) {
      submit(null, { method: "post", action: "/auth/github" });
    }
  }, [signinPress, submit]);

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
