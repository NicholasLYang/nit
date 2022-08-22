import { useRouter } from "next/router";
import client from "../../apollo-client";
import { gql } from "@apollo/client";
import { GetServerSidePropsContext } from "next";
import { HiOutlineDocument, HiFolder } from "react-icons/hi";
import { useState } from "react";
import FileContent from "../../components/FileContent";
import { Repository } from "../../components/types";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (context.params) {
    const { data } = await client.query({
      query: gql`
        query RepositoryContents($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            object(expression: "HEAD:") {
              ... on Tree {
                entries {
                  name
                  type
                  mode

                  object {
                    ... on Blob {
                      byteSize
                      text
                      isBinary
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: { owner: context.params.owner, name: context.params.repo },
    });

    return { props: { repository: data.repository } };
  }
}

function EntryIcon({ type }) {
  if (type === "blob") {
    return <HiOutlineDocument />;
  }

  return <HiFolder />;
}

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  repository: Repository;
}

export default function RepositoryPage({ repository }: Props) {
  const router = useRouter();
  const [openFile, setOpenFile] = useState(
    repository.object.entries.find((e) => e.name === "README.md") || undefined
  );
  const { owner, repo } = router.query;

  return (
    <div className="p-1">
      <h1 className="text-3xl p-2">
        {owner}/{repo}
      </h1>
      <div className="flex">
        <ul className="space-y-2 p-10">
          {repository.object.entries.map((file) => (
            <li
              onClick={() => {
                if (file.type === "blob") {
                  setOpenFile(file);
                }
              }}
              className={classNames(
                "flex items-center p-2",
                file.name === openFile?.name && "bg-cyan-100"
              )}
              key={file.name}
            >
              <EntryIcon type={file.type} />
              <span className="pl-3">{file.name}</span>
            </li>
          ))}
        </ul>
        {openFile && <FileContent file={openFile} />}
      </div>
    </div>
  );
}
