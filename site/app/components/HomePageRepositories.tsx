import { HomePageRepositories } from "~/types";
import KeyIcon from "~/components/KeyIcon";
import { Link, useSubmit } from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";

interface Props {
  repositories: HomePageRepositories;
}

export default function HomePageRepositories({ repositories }: Props) {
  const submit = useSubmit();

  useHotkeys("0, 1, 2, 3", (event) => {
    const number = parseInt(event.key);
    if (number >= 0 && number < 4 && repositories.recentlyVisited[number]) {
      submit(null, {
        method: "get",
        action: `/${repositories.recentlyVisited[number]}`,
      });
    }
  });

  return (
    <div>
      {repositories.pinned.length > 0 && (
        <div className="p-5">
          <h2 className="text-left text-lg font-semibold">Pinned</h2>
          <ul className="space-x-5">
            {repositories.pinned.map((repo, index) => (
              <li className="box">
                <Link className="flex items-center p-3" to={`/${repo}`}>
                  <KeyIcon>{index}</KeyIcon>
                  <span className="px-2 text-lg">{repo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {repositories.recentlyVisited.length > 0 && (
        <div className="p-5">
          <h2 className="text-left text-lg font-semibold">Recently Visited</h2>
          <ul className="space-x-5">
            {repositories.recentlyVisited.map((repo, index) => (
              <li className="box">
                <Link className="flex items-center p-3" to={`/${repo}`}>
                  <KeyIcon>{index}</KeyIcon>
                  <span className="px-2 text-lg">{repo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
