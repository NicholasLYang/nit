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
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: styles },
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
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
