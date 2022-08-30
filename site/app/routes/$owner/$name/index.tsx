import { Link, useParams } from "@remix-run/react";

export default function Index() {
  const params = useParams();
  return (
    <div className="grid-template-rows-3 grid grow">
      <Link
        to={`/${params.owner}/${params.name}/issues`}
        className="flex h-60 w-60 items-center justify-center rounded text-xl shadow"
      >
        <span className="font-bold">h</span>ome
      </Link>
      <Link
        to={`/${params.owner}/${params.name}/issues`}
        className="flex h-60 w-60 items-center justify-center rounded text-xl shadow"
      >
        <span className="font-bold">i</span>ssues
      </Link>
    </div>
  );
}
