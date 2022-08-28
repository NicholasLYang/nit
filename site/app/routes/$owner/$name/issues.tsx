import { Issue } from "~/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext, useParams, useSubmit } from "@remix-run/react";
import { classNames } from "~/utils";

export default function Issues() {
  const issues = useOutletContext();
  const submit = useSubmit();
  const params = useParams();
  const selectedRef = useRef(null);
  const [selectedIssue, setSelectedIssue] = useState(0);
  const handleKeyPress = useCallback((event) => {
    switch (event.keyCode) {
      case 66: {
        // b
        submit(null, {
          method: "get",
          action: `/${params.owner}/${params.name}`,
        });
        break;
      }
      case 13: {
        // Enter
        const id = issues[selectedIssue].databaseId;
        submit(null, {
          method: "get",
          action: `/${params.owner}/${params.name}/issues/${id}`,
        });
        break;
      }
      case 9: {
        // Tab
        event.preventDefault();
        setSelectedIssue((selected) => (selected + 1) % issues.length);
      }
    }
  }, []);

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <div>
      <div className="flex p-10">
        <div className="flex h-24 w-60 items-center justify-center rounded shadow">
          <span className="font-bold">B</span>ack
        </div>
        <div className="flex h-24 w-60 items-center justify-center rounded shadow">
          <span className="font-bold">S</span>earch
        </div>
        <div className="flex h-24 w-60 items-center justify-center rounded shadow">
          <span className="font-bold">N</span>ew
        </div>
      </div>
      <ul className="space-y-2">
        {issues.map((issue, i) => (
          <li
            key={issue.id}
            className={classNames(
              "rounded p-2 shadow",
              i === selectedIssue && "border border-cyan-400"
            )}
            ref={i === selectedIssue ? selectedRef : undefined}
          >
            {issue.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
