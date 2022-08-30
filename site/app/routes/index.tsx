import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import { authenticator } from "~/auth.server";
import { useEffect, useRef } from "react";

export async function loader({ request }: LoaderArgs) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
}

export async function action({ request }: ActionArgs) {
  const params = await request.formData();

  return redirect("/" + params.get("repoName"));
}

export default function Index() {
  const ref = useRef(null);
  const submit = useSubmit();
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, [ref]);

  return (
    <main className="grid h-screen place-items-center">
      <div className="text-center">
        GitFocus
        <form method="post" action="/?index">
          <input
            name="repoName"
            ref={ref}
            type="text"
            placeholder="facebook/react"
            className="text-center placeholder:text-center"
            pattern="[\w-]+/[\w-]+"
          />
        </form>
        <form className="flex justify-center" method="post" action="/logout">
          <button
            type="submit"
            className="mt-5 flex items-center justify-center rounded-lg border p-5 shadow"
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
