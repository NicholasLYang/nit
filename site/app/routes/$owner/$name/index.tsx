import { Link, useOutletContext, useParams, useSubmit } from "@remix-run/react";
import KeyIcon from "~/components/KeyIcon";
import { useHotkeys } from "react-hotkeys-hook";

export default function Index() {
  const { owner, name } = useParams();
  const { readMe } = useOutletContext();
  const submit = useSubmit();

  useHotkeys("i", () => {
    submit(null, { method: "get", action: `/${owner}/${name}/issues` });
  });
  useHotkeys("b", () => {
    submit(null, { method: "get", action: "/" });
  });
  useHotkeys("p", () => {
    submit(null, { method: "get", action: `/${owner}/${name}/pulls` });
  });
  useHotkeys("s", () => {
    submit(null, { method: "get", action: `/${owner}/${name}/search` });
  });

  return (
    <>
      <div className="flex flex-wrap space-x-7 pb-5">
        <Link to={"/"}>
          <KeyIcon>b</KeyIcon> Back Home
        </Link>
        <Link to={`/${owner}/${name}/issues`}>
          <KeyIcon>i</KeyIcon> Issues
        </Link>
        <Link to={`/${owner}/${name}/pulls`}>
          <KeyIcon>p</KeyIcon> Pull requests
        </Link>
      </div>
      <pre className="w-2/3 whitespace-pre-wrap py-5">{readMe}</pre>
    </>
  );
}
