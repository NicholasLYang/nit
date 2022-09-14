import KeyIcon from "~/components/KeyIcon";
import { Link, useSubmit } from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";

interface Props {
  recentlyVisited: string[];
  pinned: string[];
}

export default function HomePageRepositories({
  recentlyVisited,
  pinned,
}: Props) {
  const submit = useSubmit();

  useHotkeys("0, 1, 2, 3", (event) => {
    const number = parseInt(event.key);
    if (number >= 0 && number < 4 && recentlyVisited[number]) {
      submit(null, {
        method: "get",
        action: `/${recentlyVisited[number]}`,
      });
    }
  });

  useHotkeys("4, 5, 6, 7, 8, 9", (event) => {
    const number = parseInt(event.key);
    const index = number - 4;
    if (number > 3 && number < 10 && pinned[index]) {
      submit(null, {
        method: "get",
        action: `/${pinned[index]}`,
      });
    }
  });

  return (
    <div className="flex w-3/4">
      {recentlyVisited.length > 0 && (
        <div className="p-5">
          <h2 className="text-left text-lg font-semibold">Recently Visited</h2>
          <ul className="flex flex-wrap gap-2">
            {recentlyVisited.map((repo, index) => (
              <li className="box w-96">
                <Link className="flex items-center p-3" to={`/${repo}`}>
                  <KeyIcon>{index}</KeyIcon>
                  <span className="truncate px-2 text-sm">{repo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {pinned.length > 0 && (
        <div className="p-5">
          <h2 className="text-left text-lg font-semibold">Pinned</h2>
          <ul className="flex flex-col gap-2">
            {pinned.map((repo, index) => (
              <li className="box w-96">
                <Link className="flex items-center p-3" to={`/${repo}`}>
                  <KeyIcon>{index + 4}</KeyIcon>
                  <span className="truncate px-2 text-sm">{repo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
