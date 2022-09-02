import { useOutletContext, useParams, useSubmit } from "@remix-run/react";
import KeyIcon from "~/components/KeyIcon";
import { useKeyPress } from "~/utils";
import { useEffect } from "react";

export default function PullRequests() {
  const { pullRequests } = useOutletContext();
  const params = useParams();
  const backKeypress = useKeyPress("b");
  const submit = useSubmit();

  useEffect(() => {
    console.log(backKeypress);
    if (backKeypress) {
      submit(null, {
        method: "get",
        action: `/${params.owner}/${params.name}`,
      });
    }
  }, [backKeypress, submit]);

  if (pullRequests.length === 0) {
    return (
      <div className="flex flex-grow items-center">
        No pull requests open. Go <KeyIcon>b</KeyIcon>ack?
      </div>
    );
  }

  return (
    <div className="flex-grow">
      <ul>
        {pullRequests.map((pr) => (
          <li>{pr.title}</li>
        ))}
      </ul>
    </div>
  );
}
