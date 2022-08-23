import { useRouter } from "next/router";
import client from "../../apollo-client";
import { gql } from "@apollo/client";
import { GetServerSidePropsContext } from "next";
import { useCallback, useEffect } from "react";
import { Directory } from "../../components/types";
import DirectoryView from "../../components/DirectoryView";
import { useDispatch, useSelector } from "react-redux";
import {
  decrementDirectory,
  incrementDirectory,
  decrementEntry,
  incrementEntry,
  initialize,
  RootState,
} from "../../store";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (context.params) {
    const { data } = await client.query({
      query: gql`
        query RepositoryContents($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            id
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
  const dispatch = useDispatch();
  const { owner, repo } = router.query;
  const isInitialized = useSelector(
    (state: RootState) => state.repo.isInitialized
  );
  useEffect(() => {
    if (repository) {
      dispatch(initialize({ repository }));
    }
  }, [dispatch]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      console.log(event.key);
      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          dispatch(incrementEntry());
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          dispatch(decrementEntry());

          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          dispatch(incrementDirectory());
          break;
        }
        case "ArrowLeft": {
          event.preventDefault();
          dispatch(decrementDirectory());
          break;
        }
        // No default
      }
    },
    [repository.object.entries.length]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="p-1">
      <h1 className="text-3xl p-2">
        {owner}/{repo}
      </h1>
      {isInitialized && (
        <DirectoryView
          repoName={repo}
          repoOwner={owner}
          nestingLevel={0}
          directory={repository}
        />
      )}
    </div>
  );
}
