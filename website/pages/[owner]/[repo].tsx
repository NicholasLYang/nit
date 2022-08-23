import { useRouter } from "next/router";
import client from "../../apollo-client";
import { gql } from "@apollo/client";
import { GetServerSidePropsContext } from "next";
import { useCallback, useEffect, useState } from "react";
import EntryContent from "../../components/EntryContent";
import { Directory } from "../../components/types";
import DirectoryView from "../../components/DirectoryView";

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
                    ... on Tree {
                      oid
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

interface Props {
  repository: Directory;
}

export default function RepositoryPage({ repository }: Props) {
  const router = useRouter();

  const { owner, repo } = router.query;
  // const handleKeyPress = useCallback(
  //   (event: KeyboardEvent) => {
  //     if (event.key === "ArrowDown") {
  //       event.preventDefault();
  //       setOpenFile((openFile) => {
  //         if (openFile) {
  //           return (openFile + 1) % repository.object.entries.length;
  //         }
  //       });
  //     } else if (event.key === "ArrowUp") {
  //       event.preventDefault();
  //       setOpenFile((openFile) => {
  //         if (openFile) {
  //           return (
  //             (openFile + repository.object.entries.length - 1) %
  //             repository.object.entries.length
  //           );
  //         }
  //       });
  //     }
  //   },
  //   [repository.object.entries.length]
  // );
  //
  // useEffect(() => {
  //   document.addEventListener("keydown", handleKeyPress);
  //
  //   return () => {
  //     document.removeEventListener("keydown", handleKeyPress);
  //   };
  // }, [handleKeyPress]);

  return (
    <div className="p-1">
      <h1 className="text-3xl p-2">
        {owner}/{repo}
      </h1>
      <DirectoryView
        repoName={repo}
        repoOwner={owner}
        nestingLevel={0}
        directory={repository}
      />
    </div>
  );
}
