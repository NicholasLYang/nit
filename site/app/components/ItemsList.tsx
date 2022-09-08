import { useCallback, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Link, useParams, useSubmit } from "@remix-run/react";
import { classNames, isInViewport } from "~/utils";
import KeyIcon from "~/components/KeyIcon";
import { ListCommands } from "~/components/ListCommands";
import sanitizeHtml from "sanitize-html";

interface ListState {
  selectedItem: number;
  peekedItem: number | undefined;
}

interface ListProps {
  items: Array<{
    id: string;
    number: number;
    titleHTML: string;
    bodyHTML: string;
  }>;
  itemName: string;
  itemSlug: string;
}

export default function ItemsList({ items, itemName, itemSlug }: ListProps) {
  const submit = useSubmit();
  const selectedRef = useRef(null);
  const { owner, name } = useParams();
  // We keep a hold of these two refs for when we need to scroll into view
  const nextSelectedRef = useRef(null);
  const previousSelectedRef = useRef(null);

  const [{ selectedItem, peekedItem }, setItemState] = useState<ListState>({
    selectedItem: 0,
    // Item that has the description expanded
    peekedItem: undefined,
  });

  const getRef = useCallback(
    (i: number) => {
      if (i === selectedItem) {
        return selectedRef;
      }
      if (i === (selectedItem + 1) % items.length) {
        return nextSelectedRef;
      }
      if (i === (selectedItem + items.length - 1) % items.length) {
        return previousSelectedRef;
      }
    },
    [selectedRef, nextSelectedRef, previousSelectedRef, selectedItem]
  );

  useHotkeys(
    "Enter",
    () => {
      const id = items[selectedItem].number;
      submit(null, {
        method: "get",
        action: `/${owner}/${name}/${itemSlug}/${id}`,
      });
    },
    [items, selectedItem]
  );

  useHotkeys(
    "k",
    () => {
      setItemState(({ peekedItem, selectedItem }) => ({
        selectedItem: (selectedItem + 1) % items.length,
        peekedItem,
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
    [items, selectedItem]
  );

  useHotkeys(
    "space",
    (event) => {
      event.preventDefault();
      if (selectedItem === peekedItem) {
        setItemState((itemState) => ({
          ...itemState,
          peekedItem: undefined,
        }));
      } else {
        setItemState((itemState) => ({
          ...itemState,
          peekedItem: itemState.selectedItem,
        }));
      }
    },
    [selectedItem, peekedItem]
  );

  useHotkeys(
    "j",
    () => {
      setItemState(({ peekedItem, selectedItem }) => ({
        selectedItem: (selectedItem + items.length - 1) % items.length,
        peekedItem,
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
    [items, selectedItem]
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
            <Link to={`/${owner}/${name}/${itemSlug}/${item.number}`}>
              <div className="flex truncate">
                <span className="pl-2 pr-4 text-slate-400">#{item.number}</span>
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(item.titleHTML),
                  }}
                />
              </div>
              {peekedItem === i && (
                <>
                  {item.bodyHTML === "" ? (
                    <div className="mt-5 max-h-96 truncate bg-slate-100 p-6">
                      <span className="italic">No description provided.</span>
                    </div>
                  ) : (
                    <div
                      className="mt-5 max-h-96 truncate bg-slate-100 p-6"
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
