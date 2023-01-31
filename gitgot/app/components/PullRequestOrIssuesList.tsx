import { useCallback, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Link, useParams, useSubmit } from "@remix-run/react";
import { classNames, isInViewport } from "~/utils";
import KeyIcon from "~/components/KeyIcon";
import { ListCommands } from "~/components/ListCommands";
import sanitizeHtml from "sanitize-html";
import IssueLockIcon from "~/components/IssueLockIcon";
import { DecryptionStatus } from "~/types";

interface ListState {
  selectedItem: number;
  peekedItem: number | undefined;
}

interface ListProps {
  items: Array<{
    id: string;
    number: number;
    titleHTML: string;
    title?: string;
    bodyHTML: string;
    isEncrypted?: boolean;
    assignees: {
      nodes: Array<{
        login: string;
        avatarUrl: string;
      }>;
    };
  }>;
  itemName: string;
  itemSlug: string;
}

export default function PullRequestOrIssuesList({
  items,
  itemName,
  itemSlug,
}: ListProps) {
  const submit = useSubmit();
  const { owner, name } = useParams();
  // We keep a hold of these two refs for when we need to scroll into view
  const nextSelectedRef = useRef<HTMLLIElement>(null);
  const previousSelectedRef = useRef<HTMLLIElement>(null);

  const [{ selectedItem, peekedItem }, setItemState] = useState<ListState>({
    selectedItem: 0,
    // Item that has the description expanded
    peekedItem: undefined,
  });

  const getRef = useCallback(
    (i: number) => {
      if (i === (selectedItem + 1) % items.length) {
        return nextSelectedRef;
      }
      if (i === (selectedItem + items.length - 1) % items.length) {
        return previousSelectedRef;
      }
    },
    [nextSelectedRef, previousSelectedRef, selectedItem]
  );

  if (items.length === 0) {
    return (
      <div className="flex items-center py-10">
        <span className="pr-1">
          No {itemName} open, press <KeyIcon>h</KeyIcon> to go back
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center py-10">
      <ul className="flex w-full flex-col items-center space-y-4">
        {items.map((item, i) => (
          <li
            key={item.id}
            className="w-full max-w-3xl border-2 border-slate-800 bg-white p-2 shadow-block hover:border-blue-500"
            ref={getRef(i)}
          >
            <Link to={`/${owner}/${name}/${itemSlug}/${item.number}`}>
              <div className="flex items-center truncate">
                <span className="pl-2 pr-4 text-slate-400">#{item.number}</span>
                {item.isEncrypted && (
                  <IssueLockIcon
                    className="pr-2"
                    status={DecryptionStatus.MySecret}
                  />
                )}
                {item.title && <div>{item.title}</div>}
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(item.titleHTML),
                  }}
                />
                <span className="px-5">
                  {item.assignees.nodes.map((user) => (
                    <Link key={user.login} to={`/${user.login}`}>
                      <img
                        src={user.avatarUrl}
                        className="w-8"
                        alt={`Avatar for user ${user.login}`}
                      />
                    </Link>
                  ))}
                </span>
              </div>
              {peekedItem === i && (
                <>
                  {item.bodyHTML === "" ? (
                    <div className="mt-5 max-h-96 truncate bg-slate-100 p-6">
                      <span className="italic">No description provided.</span>
                    </div>
                  ) : (
                    <div
                      className="mt-5 max-h-96 whitespace-normal bg-slate-100 p-6"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(item.bodyHTML),
                      }}
                    />
                  )}
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
