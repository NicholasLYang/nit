import { useCallback, useRef, useState } from "react";
import { Link, useOutletContext, useParams, useSubmit } from "@remix-run/react";
import { classNames, isInViewport } from "~/utils";
import KeyIcon from "~/components/KeyIcon";
import { useHotkeys } from "react-hotkeys-hook";
import sanitizeHtml from "sanitize-html";
import { ListCommands } from "~/components/ListCommands";

interface IssuesState {
  selectedIssue: number;
  peekedIssue: number | undefined;
}

export default function Issues() {
  const { issues } = useOutletContext();
  const submit = useSubmit();
  const params = useParams();
  const selectedRef = useRef(null);
  // We keep a hold of these two refs for when we need to scroll into view
  const nextSelectedRef = useRef(null);
  const previousSelectedRef = useRef(null);

  const [{ selectedIssue, peekedIssue }, setIssueState] = useState<IssuesState>(
    {
      selectedIssue: 0,
      // Issue that has the description expanded
      peekedIssue: undefined,
    }
  );

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

  useHotkeys("b", () => {
    submit(null, {
      method: "get",
      action: `/${params.owner}/${params.name}`,
    });
  });

  useHotkeys(
    "Enter",
    () => {
      const id = issues[selectedIssue].number;
      submit(null, {
        method: "get",
        action: `/${params.owner}/${params.name}/issues/${id}`,
      });
    },
    [issues, selectedIssue]
  );

  useHotkeys(
    "k",
    () => {
      setIssueState(({ peekedIssue, selectedIssue }) => ({
        selectedIssue: (selectedIssue + 1) % issues.length,
        peekedIssue,
      }));

      if (nextSelectedRef.current) {
        nextSelectedRef.current.focus();

        if (!isInViewport(nextSelectedRef.current)) {
          nextSelectedRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    },
    [issues, selectedIssue]
  );

  useHotkeys(
    "space",
    () => {
      if (selectedIssue === peekedIssue) {
        setIssueState((issueState) => ({
          ...issueState,
          peekedIssue: undefined,
        }));
      } else {
        setIssueState((issueState) => ({
          ...issueState,
          peekedIssue: issueState.selectedIssue,
        }));
      }
    },
    [selectedIssue, peekedIssue]
  );

  useHotkeys(
    "j",
    () => {
      setIssueState(({ peekedIssue, selectedIssue }) => ({
        selectedIssue: (selectedIssue + issues.length - 1) % issues.length,
        peekedIssue,
      }));

      if (previousSelectedRef.current) {
        previousSelectedRef.current.focus();
        if (!isInViewport(previousSelectedRef.current)) {
          previousSelectedRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    },
    [issues, selectedIssue]
  );

  if (issues.length === 0) {
    return (
      <div className="flex items-center">
        <span className="pr-1">No issues open, go</span>
        <KeyIcon>b</KeyIcon>
        <span style={{ paddingLeft: "1.5px" }}>ack?</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center pb-10">
      <h1 className="pb-10 text-3xl font-bold">Issues</h1>
      <ListCommands backTo="repo page" />
      <ul className="w-full space-y-2">
        {issues.map((issue, i) => (
          <li
            key={issue.id}
            className={classNames(
              "max-w-2xl rounded p-2 shadow",
              i === selectedIssue && "border border-cyan-400"
            )}
            ref={getRef(i)}
          >
            <Link to={`/${params.owner}/${params.name}/issues/${issue.number}`}>
              <div className="flex truncate">
                <span className="pl-2 pr-4 text-slate-300">
                  #{issue.number}
                </span>
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(issue.titleHTML),
                  }}
                />
              </div>
              {peekedIssue === i && (
                <div
                  className="mt-5 max-h-96 truncate bg-slate-100 p-6"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(issue.bodyHTML),
                  }}
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
