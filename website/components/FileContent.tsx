import ReactMarkdown from "react-markdown";
import { File } from "./types";

interface Props {
  file: File;
}

export default function FileContent({ file }: Props) {
  if (file.name.endsWith(".md")) {
    return (
      <div className="prose lg:prose-xl">
        <ReactMarkdown>{file.object.text}</ReactMarkdown>
      </div>
    );
  }

  return <pre>{file.object.text}</pre>;
}
