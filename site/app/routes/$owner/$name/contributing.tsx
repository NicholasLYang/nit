import { useOutletContext, useParams, useSubmit } from "@remix-run/react";
import RawHTMLContainer from "~/components/RawHTMLContainer";
import { useHotkeys } from "react-hotkeys-hook";

export default function ContributingPage() {
  const { contributing } = useOutletContext();
  const params = useParams();
  const submit = useSubmit();

  useHotkeys("h", () => {
    submit(null, { method: "get", action: `/${params.owner}/${params.name}` });
  });

  return <RawHTMLContainer html={contributing} />;
}
