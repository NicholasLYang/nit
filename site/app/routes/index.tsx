import { redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";

export async function action({ request }) {
  const params = await request.formData();

  return redirect("/" + params.get("repoName"));
}

export default function Index() {
  return (
    <main className="grid place-items-center h-screen">
      <div className="text-center">
      Nit
      <form method="post" action="/?index">
        <input name="repoName" type="text" placeholder="facebook/react" className="placeholder:text-center text-center" pattern="\w+/\w+" />
      </form>
      </div>
    </main>
  );
}
