import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { useEffect, useRef, useState } from "react";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useHotkeys } from "react-hotkeys-hook";
import ActionButton from "~/components/ActionButton";
import KeyIcon from "~/components/KeyIcon";
import { getRandomRepository } from "~/utils";

export async function action({ request }: ActionArgs) {
  const body = await request.formData();
  return redirect(`/${body.get("repository")}`);
}

export async function loader({ request }: LoaderArgs) {
  const { profile } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  return {
    randomRepository: getRandomRepository(),
    login: profile.displayName,
  };
}

export default function Index() {
  const ref = useRef<HTMLInputElement>(null);
  const { login, randomRepository } = useLoaderData();
  const submit = useSubmit();
  const [showRepoInput, setShowRepoInput] = useState(false);

  useHotkeys("command+b", () => {
    submit(null, { method: "post", action: "/logout" });
  });

  useHotkeys("command+u", () => {
    submit(null, { method: "get", action: "/feedback" });
  });

  useHotkeys("m", () => {
    submit(null, { method: "get", action: `/${login}` });
  });

  useHotkeys("g", (event) => {
    event.preventDefault();
    setShowRepoInput(true);
  });

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();

      const onKeydown = (event: KeyboardEvent) => {
        if (event.metaKey && event.key === "b") {
          submit(null, { method: "post", action: "/logout" });
        }
        if (event.metaKey && event.key === "u") {
          submit(null, { method: "get", action: "/feedback" });
        }
        if (event.metaKey && event.key === "i") {
          setShowRepoInput(false);
        }
      };

      ref.current.addEventListener("keydown", onKeydown);
    }
  }, [ref.current, showRepoInput, setShowRepoInput]);

  return (
    <main>
      <div className="flex">
        <ActionButton method="post" action="/logout">
          Log out <span className="text-slate-400">&#8984;B</span>
        </ActionButton>
        <ActionButton method="get" action="/feedback">
          Feedback <span className="text-slate-400">&#8984;U</span>
        </ActionButton>
      </div>
      <div className="flex h-screen items-center justify-center">
        <div className="mb-20 flex flex-col items-center text-center">
          <h1 className="py-4 text-2xl font-semibold">gitgot</h1>
          {showRepoInput ? (
            <div>
              <div className="flex flex-col items-start pb-5">
                <span>
                  <KeyIcon>&#8984;I</KeyIcon> Back
                </span>
              </div>
              <form className="flex" method="post" action="/?index">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  type="text"
                  ref={ref}
                  tabIndex={100}
                  name="repository"
                  id="repository"
                  placeholder={randomRepository}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  className="box m-2 disabled:bg-black disabled:text-white"
                  type="submit"
                >
                  ENTER
                </button>
              </form>
            </div>
          ) : (
            <div className="space-x-5">
              <span>
                <KeyIcon>m</KeyIcon> My Repositories
              </span>
              <span>
                <KeyIcon>g</KeyIcon> Go To Repository
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
