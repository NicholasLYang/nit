import { useOutletContext, useParams, useSubmit } from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";
import ItemsList from "~/components/ItemsList";
import KeyIcon from "~/components/KeyIcon";

export default function PullRequests() {
  const { pullRequests } = useOutletContext();
  const params = useParams();
  const submit = useSubmit();

  useHotkeys("h", () => {
    submit(null, {
      method: "get",
      action: `/${params.owner}/${params.name}`,
    });
  });

  return (
    <div>
      <h1 className="p-2 text-3xl font-bold">Pull Requests</h1>
      <div className="space-x-5 p-4">
        <span>
          <KeyIcon>h</KeyIcon> Go back to repository
        </span>
        <span>
          <KeyIcon>n</KeyIcon> New Pull Request
        </span>
      </div>
      <ItemsList
        items={pullRequests}
        itemName="pull requests"
        itemSlug="pulls"
      />
    </div>
  );
}
