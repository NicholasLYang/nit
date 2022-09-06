import { useOutletContext, useParams, useSubmit } from "@remix-run/react";
import KeyIcon from "~/components/KeyIcon";
import { useCallback, useEffect, useState } from "react";
import { ListCommands } from "~/components/ListCommands";
import { useHotkeys } from "react-hotkeys-hook";

export default function PullRequests() {
  const { pullRequests } = useOutletContext();
  const params = useParams();
  const submit = useSubmit();
  const [selectedPullRequest, setSelectedPullRequest] = useState(0);

  useHotkeys("b", () => {
    // b
    submit(null, {
      method: "get",
      action: `/${params.owner}/${params.name}`,
    });
  });

  const handleKeyPress = useCallback(
    (event) => {
      if (event.keyCode >= 48 && event.keyCode <= 57) {
        const index = event.keyCode - 48;
        const prNumber = pullRequests[index].number;

        submit(null, {
          method: "get",
          action: `/${params.owner}/${params.name}/pulls/${prNumber}`,
        });
      }
    },
    [pullRequests]
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  if (pullRequests.length === 0) {
    return (
      <div className="flex items-center">
        <span className="pr-1">No pull requests open, go </span>
        <KeyIcon>b</KeyIcon>
        <span style={{ paddingLeft: "1.5px" }}>ack?</span>
      </div>
    );
  }

  return (
    <div className="flex-grow">
      <ListCommands backTo="Repo" />
      <ul>
        {pullRequests.map((pr, index) => (
          <li key={pr.id} className="m-2 flex justify-between p-2 shadow">
            <span className="px-5">{pr.title}</span>
            {index < 10 && <KeyIcon>{index}</KeyIcon>}
          </li>
        ))}
      </ul>
    </div>
  );
}
