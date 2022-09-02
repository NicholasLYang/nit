import { Link, useParams } from "@remix-run/react";
import KeyIcon from "~/components/KeyIcon";

export default function Index() {
  const params = useParams();
  return (
    <div className="flex grow flex-wrap space-x-5">
      <Link
        to={`/${params.owner}/${params.name}/issues`}
        className="flex h-60 w-60 items-center justify-center rounded text-xl shadow"
      >
        <KeyIcon>h</KeyIcon>ome
      </Link>
      <Link
        to={`/${params.owner}/${params.name}/issues`}
        className="flex h-60 w-60 items-center justify-center rounded text-xl shadow"
      >
        <KeyIcon>i</KeyIcon>ssues
      </Link>
      <Link
        to={`/${params.owner}/${params.name}/pulls`}
        className="flex h-60 w-60 items-center justify-center rounded text-xl shadow"
      >
        <KeyIcon>p</KeyIcon>ull requests
      </Link>
    </div>
  );
}
