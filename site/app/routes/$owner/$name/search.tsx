import { authenticator } from "~/auth.server";
import { LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
}

export default function SearchPage() {
  return (
    <div>
      <form>
        <input type="text" />
      </form>
    </div>
  );
}
