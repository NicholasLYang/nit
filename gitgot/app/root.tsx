import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useSubmit,
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";
import { useHotkeys } from "react-hotkeys-hook";
import styles from "~/styles/index.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: tailwindStylesheetUrl },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "gitgot",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  const submit = useSubmit();

  useHotkeys("command+/", () => {
    window.location.href = `https://github.com${window.location.pathname}`;
  });
  useHotkeys("command+i", (event) => {
    event.preventDefault();
    submit(null, { method: "get", action: "/" });
  });
  useHotkeys("command+b", (event) => {
    event.preventDefault();
    submit(null, { method: "post", action: "/logout" });
  });
  useHotkeys("command+u", (event) => {
    event.preventDefault();
    submit(null, { method: "get", action: "/feedback" });
  });

  return (
    <html lang="en" className="h-full">
      <head>
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "4e15da0efa3140c9be9e055e30014cc8"}'
        />
        <Meta />
        <Links />
      </head>
      <body className="min-h-full w-full bg-[#ffd7ca]">
        <div className="flex items-stretch">
          <div className="max-w-lg space-y-5 px-24 py-20">
            <h1 className="text-4xl font-extralight">
              Create <span className="font-semibold">Secret</span>
              <br /> GitHub Issues
            </h1>
            <p>
              Why?
              <ul className="list-inside list-disc">
                <li>To report bugs with proprietary code.</li>
                <li>To discuss potentially non-public plans.</li>
                <li>Or maybe you just don't like snoopers</li>
              </ul>
            </p>
            <p>
              How?
              <ul className="list-inside list-disc">
                <li>Write an issue and add whoever you want.</li>
                <li>Owner of the repository can always read the issue</li>
              </ul>
            </p>
            <p>
              Don't
              <ul className="list-inside list-disc">
                <li>
                  Use this to disclose security issues or extremely sensitive
                  information.
                </li>
                <li>Write creepy stuff.</li>
              </ul>
            </p>
          </div>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
