import {
  Outlet,
  useLoaderData,
  useLocation,
  useSubmit,
} from "@remix-run/react";
import { LoaderArgs } from "@remix-run/node";
import { gql } from "@apollo/client";
import client from "~/apollo-client";
import { authenticator } from "~/auth.server";
import { Converter } from "showdown";
import ActionButton from "~/components/ActionButton";
import { Issue, PullRequest } from "~/types";
import { addVisitedRepository } from "~/models/user.server";

export async function loader({ params, request }: LoaderArgs) {
  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  await addVisitedRepository(id, `${params.owner}/${params.name}`);
  return { owner: params.owner, name: params.name };
}

export default function Repository() {
  const location = useLocation();
  const { owner, name } = useLoaderData();

  return (
    <main className="flex flex-col items-center pb-10">
      <div className="flex flex-wrap space-x-7 self-start p-5">
        <ActionButton method="post" action="/logout">
          Go Home <span className="text-slate-400">&#8984;I</span>
        </ActionButton>
        <ActionButton method="post" action="/logout">
          Log out <span className="text-slate-400">&#8984;B</span>
        </ActionButton>
        <ActionButton method="get" action="/feedback">
          Feedback <span className="text-slate-400">&#8984;U</span>
        </ActionButton>
        <ActionButton href={`https://github.com/${location.pathname}`}>
          Go To GitHub <span className="text-slate-400">&#8984;/</span>
        </ActionButton>
      </div>
      <div className="flex items-center p-5">
        <h1 className="pt-5">
          <span className="font-bold">{owner}</span> / {name}
        </h1>
      </div>
      <Outlet />
    </main>
  );
}
