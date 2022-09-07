import { useOutletContext, useParams, useSubmit } from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";
import ItemsList from "~/components/ItemsList";

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

  return <ItemsList items={issues} itemName="issues" itemSlug="issues" />;
}
