import { Form } from "@remix-run/react";
import * as React from "react";

export default function LoginPage() {
  return (
    <Form method="post" action="/auth/github">
      <button>Sign In</button>
    </Form>
  );
}
