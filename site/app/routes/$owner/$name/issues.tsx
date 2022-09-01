import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useOutletContext, useParams, useSubmit } from "@remix-run/react";
import { classNames, isInViewport } from "~/utils";

export default function Issues() {
  const issues = useOutletContext();
  const submit = useSubmit();
  const params = useParams();
  const selectedRef = useRef(null);
  // We keep a hold of these two refs for when we need to scroll into view
  const nextSelectedRef = useRef(null);
  const previousSelectedRef = useRef(null);

  const [{ selectedIssue, previewedIssues }, setIssueState] = useState({
    selectedIssue: 0,
    previewedIssues: new Set(),
  });

  const getRef = useCallback(
    (i: number) => {
      if (i === selectedIssue) {
        return selectedRef;
      }
      if (i === (selectedIssue + 1) % issues.length) {
        return nextSelectedRef;
      }
      if (i === (selectedIssue + issues.length - 1) % issues.length) {
        return previousSelectedRef;
      }
    },
    [selectedRef, nextSelectedRef, previousSelectedRef, selectedIssue]
  );

  const handleKeyPress = useCallback(
    (event) => {
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
          const id = issues[selectedIssue].number;
          submit(null, {
            method: "get",
            action: `/${params.owner}/${params.name}/issues/${id}`,
          });
          break;
        }
        case 9: {
          // Tab
          event.preventDefault();
          if (event.shiftKey) {
            setIssueState(({ previewedIssues, selectedIssue }) => ({
              selectedIssue:
                (selectedIssue + issues.length - 1) % issues.length,
              previewedIssues,
            }));
            if (
              previousSelectedRef.current &&
              !isInViewport(previousSelectedRef.current)
            ) {
              previousSelectedRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          } else {
            setIssueState(({ previewedIssues, selectedIssue }) => ({
              selectedIssue: (selectedIssue + 1) % issues.length,
              previewedIssues,
            }));

            if (
              nextSelectedRef.current &&
              !isInViewport(nextSelectedRef.current)
            ) {
              nextSelectedRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }
          break;
        }
      }
    },
    [selectedIssue, previewedIssues, setIssueState]
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [previewedIssues, selectedIssue]);

  if (issues.length === 0) {
    return <div className="flex-grow">No issues, go <span className="font-bold">b</span>ack</div>
  }
  return (
    <div className="flex flex-col items-center pb-10">
      <div className="flex p-10">
        <Link
          to={`/${params.owner}/${params.name}`}
          className="flex h-24 w-60 items-center justify-center rounded shadow"
        >
          <span className="font-bold">B</span>ack
        </Link>
        <Link
          to={`/${params.owner}/${params.name}/issues/search`}
          className="flex h-24 w-60 items-center justify-center rounded shadow"
        >
          <span className="font-bold">S</span>earch
        </Link>
        <Link
          to={`/${params.owner}/${params.name}/issues/new`}
          className="flex h-24 w-60 items-center justify-center rounded shadow"
        >
          <span className="font-bold">N</span>ew
        </Link>
      </div>
      <ul className="space-y-2">
        {issues.map((issue, i) => (
          <li
            key={issue.id}
            className={classNames(
              "max-w-2xl rounded p-2 shadow",
              i === selectedIssue && "border border-cyan-400"
            )}
            ref={getRef(i)}
          >
            <div className="truncate">
              <span className="pl-2 pr-4 text-slate-300">#{issue.number}</span>
              {issue.title}
            </div>
            {previewedIssues.has(i) && (
              <div
                className="mt-5 overflow-auto bg-slate-100 p-6"
                dangerouslySetInnerHTML={{ __html: issue.bodyHTML }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
