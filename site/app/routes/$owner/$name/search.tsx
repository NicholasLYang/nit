import { authenticator } from "~/auth.server";

export async function loader() {
  const { installations } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
}

export default function SearchPage() {
  return (
    <div>
      <input />
    </div>
  );
}
