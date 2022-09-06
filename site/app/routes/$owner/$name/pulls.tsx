import { useOutletContext, useParams, useSubmit } from "@remix-run/react";
import KeyIcon from "~/components/KeyIcon";
import { useCallback, useEffect } from "react";

export default function PullRequests() {
  const { pullRequests } = useOutletContext();
  const params = useParams();
  const submit = useSubmit();

  const handleKeyPress = useCallback(
    (event) => {
      // b
      if (event.keyCode === 66) {
        {
          // b
          submit(null, {
            method: "get",
            action: `/${params.owner}/${params.name}`,
          });
        }
      } else if (event.keyCode >= 48 && event.keyCode <= 57) {
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
      <div className="flex flex-grow items-center">
        No pull requests open. Go <KeyIcon>b</KeyIcon>ack?
      </div>
    );
  }

  return (
    <div className="flex-grow">
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
