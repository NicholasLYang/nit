import { Link, useOutletContext, useParams, useSubmit } from "@remix-run/react";
import KeyIcon from "~/components/KeyIcon";
import { useHotkeys } from "react-hotkeys-hook";

export default function Index() {
  const { owner, name } = useParams();
  const { contributing, readMe, hasIssuesEnabled } = useOutletContext();
  const submit = useSubmit();

  useHotkeys("i", () => {
    if (hasIssuesEnabled) {
      submit(null, { method: "get", action: `/${owner}/${name}/issues` });
    }
  });
  useHotkeys("h", () => {
    submit(null, { method: "get", action: "/" });
  });
  useHotkeys("p", () => {
    submit(null, { method: "get", action: `/${owner}/${name}/pulls` });
  });
  useHotkeys("s", () => {
    submit(null, { method: "get", action: `/${owner}/${name}/search` });
  });
  useHotkeys("c", () => {
    if (contributing) {
      submit(null, { method: "get", action: `/${owner}/${name}/contributing` });
    }
  });

  return (
    <>
      <div className="flex flex-wrap space-x-7 pb-5">
        <Link to={"/"}>
          <KeyIcon>h</KeyIcon> Home
        </Link>
        {hasIssuesEnabled && (
          <Link to={`/${owner}/${name}/issues`}>
            <KeyIcon>i</KeyIcon> Issues
          </Link>
        )}
        <Link to={`/${owner}/${name}/pulls`}>
          <KeyIcon>p</KeyIcon> Pull requests
        </Link>
        {contributing && (
          <Link to={`/${owner}/${name}/pulls`}>
            <KeyIcon>c</KeyIcon> Contributing
          </Link>
        )}
      </div>
      <div
        className="prose w-2/3 pt-10 prose-img:my-1"
        dangerouslySetInnerHTML={{ __html: readMe }}
      />
    </>
  );
}
