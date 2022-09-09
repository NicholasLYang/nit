import sanitizeHtml from "sanitize-html";

interface Props {
  html: string;
}

export default function RawHTMLContainer({ html }: Props) {
  return (
    <div
      className="prose w-2/3 pt-10 prose-img:my-1"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
