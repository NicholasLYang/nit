import { ActionArgs } from "@remix-run/node";

export async function action({ request }: ActionArgs) {
  console.log(request);
}

export default function NewIssue() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">New Issue</h1>
      <form className="flex flex-col space-y-6 p-4" method="post">
        <input type="text" placeholder="Title" />
        <textarea placeholder="Your description here" />
      </form>
    </div>
  );
}
