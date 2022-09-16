import { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export function loader({ request }: LoaderArgs) {
  return authenticator.authenticate("github", request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
}
