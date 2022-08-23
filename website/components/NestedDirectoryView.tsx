/**
 * A wrapper for DirectoryView that does the GraphQL query
 */
import { gql, useQuery } from "@apollo/client";
import DirectoryView from "./DirectoryView";
import { useEffect } from "react";

interface Props {
  oid: string;
  nestingLevel: number;
  repoOwner: string;
  repoName: string;
}

const QUERY = gql`
  query RepositoryDirectory(
    $owner: String!
    $name: String!
    $oid: GitObjectID!
  ) {
    repository(owner: $owner, name: $name) {
      object(oid: $oid) {
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
`;

export default function NestedDirectoryView({
  oid,
  nestingLevel,
  repoOwner,
  repoName,
}: Props) {
  const { data, loading, error } = useQuery(QUERY, {
    variables: { oid, owner: repoOwner, name: repoName },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.toString()}</div>;
  }

  return (
    <DirectoryView
      repoOwner={repoOwner}
      repoName={repoName}
      directory={data.repository}
      nestingLevel={nestingLevel + 1}
    />
  );
}
