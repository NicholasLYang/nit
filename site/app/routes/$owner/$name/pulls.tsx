import { useOutletContext, useParams, useSubmit } from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";
import ItemsList from "~/components/ItemsList";

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
    <ItemsList items={pullRequests} itemName="pull requests" itemSlug="pulls" />
  );
}
