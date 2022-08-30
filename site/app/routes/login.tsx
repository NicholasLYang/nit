import { Form } from "@remix-run/react";
import * as React from "react";
import { authenticator } from "~/auth.server";
import { LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export default function LoginPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Form method="post" action="/auth/github">
        <button>Sign In</button>
      </Form>
    </div>
  );
}
