import { useOutletContext, useParams, useSubmit } from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";
import ItemsList from "~/components/ItemsList";
import KeyIcon from "~/components/KeyIcon";

export default function IssuesIndex() {
  const { issues } = useOutletContext();
  const { owner, name } = useParams();
  const submit = useSubmit();

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
      </div>
      <ItemsList items={issues} itemName="issues" itemSlug="issues" />;
    </div>
  );
}
