import { useCallback, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Link, useParams, useSubmit } from "@remix-run/react";
import { classNames, isInViewport } from "~/utils";
import KeyIcon from "~/components/KeyIcon";
import { ListCommands } from "~/components/ListCommands";
import sanitizeHtml from "sanitize-html";

interface ListProps {
  items: Array<{
    id: string;
    name: string;
    url: string;
  }>;
}

export default function DocsList({ items }: ListProps) {
  // We keep a hold of these two refs for when we need to scroll into view
  const nextSelectedRef = useRef<HTMLLIElement>(null);
  const previousSelectedRef = useRef<HTMLLIElement>(null);

  const [selectedItem, setSelectedItem] = useState(0);

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

  useHotkeys(
    "Enter",
    () => {
      const { url } = items[selectedItem];
      window.open(url, "_blank");
    },
    [items, selectedItem]
  );

  useHotkeys(
    "j",
    () => {
      setSelectedItem((selectedItem) => (selectedItem + 1) % items.length);

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
    [items, selectedItem]
  );

  useHotkeys(
    "k",
    () => {
      setSelectedItem(
        (selectedItem) => (selectedItem + items.length - 1) % items.length
      );

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
    [items, selectedItem]
  );

  if (items.length === 0) {
    return (
      <div className="flex items-center py-10">
        <span className="pr-1">
          No libraries available, press <KeyIcon>h</KeyIcon> to go back
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center pt-5">
      <ListCommands />
      <ul className="flex w-full flex-col items-center space-y-4">
        {items.map((item, i) => (
          <li
            key={item.id}
            className={classNames(
              "w-full max-w-3xl border-2 border-slate-800 p-2 shadow-block",
              i === selectedItem && "border-blue-400"
            )}
            ref={getRef(i)}
          >
            <Link to={item.url}>
              <div className="flex items-center truncate">{item.name}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
