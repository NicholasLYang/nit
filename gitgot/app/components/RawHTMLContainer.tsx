import sanitizeHtml from "sanitize-html";

interface Props {
  html: string;
  className: string;
}

export default function RawHTMLContainer({ html, className, ...props }: Props) {
  return (
    <div
      className={`prose w-2/3 prose-img:my-1 ${className}`}
      {...props}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
