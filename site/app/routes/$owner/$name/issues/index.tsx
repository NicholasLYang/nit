import {
  useOutletContext,
  useParams,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";
import ItemsList from "~/components/ItemsList";
import KeyIcon from "~/components/KeyIcon";
import { ContextType } from "~/routes/$owner/$name";
import { useEffect, useRef, useState } from "react";
import { ActionArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/node";
import { GoToIssueForm } from "~/components/GoToIssueForm";

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData();
  return redirect(
    `/${params.owner}/${params.name}/issues/${formData.get("issueNumber")}`
  );
}

export default function IssuesIndex() {
  const { issues } = useOutletContext<ContextType>();
  const { owner, name } = useParams();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();

  useHotkeys("h", () => {
    submit(null, {
      method: "get",
      action: `/${owner}/${name}`,
    });
  });

  useHotkeys("n", () => {
    submit(null, {
      method: "get",
      action: `/${owner}/${name}/issues/new`,
    });
  });

  useHotkeys("g", (e) => {
    setSearchParams({ state: "goto" });
  });

  if (searchParams.get("state") === "goto") {
    return <GoToIssueForm />;
  }

  return (
    <div className="w-2/3 max-w-4xl">
      <h1 className="py-5 text-3xl font-bold">Issues</h1>
      <div className="space-x-5 py-2">
        <span>
          <KeyIcon>h</KeyIcon> Go back to repository
        </span>
        <span>
          <KeyIcon>n</KeyIcon> New issue
        </span>
        <span>
          <KeyIcon>g</KeyIcon> Go to issue
        </span>
      </div>
      <ItemsList items={issues} itemName="issues" itemSlug="issues" />
    </div>
  );
}
