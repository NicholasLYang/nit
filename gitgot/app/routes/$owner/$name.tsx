import { Outlet, useParams } from "@remix-run/react";

export default function RepositoryPage() {
  const { owner, name } = useParams();

  return (
    <div className="flex w-full flex-col items-center p-24">
      <h2>
        {owner}/<span className="font-bold">{name}</span>
      </h2>
      <Outlet />
    </div>
  );
}
