import ReactMarkdown from "react-markdown";
import { Blob, Tree } from "./types";
import NestedDirectoryView from "./NestedDirectoryView";
import ClientOnly from "./ClientOnly";

interface Props {
  file: Blob | Tree;
  nestingLevel: number;
  repoOwner: string;
  repoName: string;
}

export default function EntryContent({
  file,
  nestingLevel,
  repoOwner,
  repoName,
}: Props) {
  if (file.type === "blob") {
    if (file.name.endsWith(".md")) {
      return (
        <div className="prose lg:prose-xl p-7">
          <ReactMarkdown>{file.object.text}</ReactMarkdown>
        </div>
      );
    }

    return <pre>{file.object.text}</pre>;
  }

  return (
    <ClientOnly>
      <NestedDirectoryView
        oid={file.object.oid}
        nestingLevel={nestingLevel}
        repoName={repoName}
        repoOwner={repoOwner}
      />
    </ClientOnly>
  );
}
