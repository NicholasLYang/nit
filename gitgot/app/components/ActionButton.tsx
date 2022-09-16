import { ReactNode } from "react";

interface Props {
  method?: string;
  action?: string;
  href?: string;
  children: ReactNode;
  className?: string;
}

export default function ActionButton({
  method,
  action,
  href,
  children,
  className,
}: Props) {
  if (href) {
    return (
      <a
        style={{
          border: "2px solid #1e293b",
          boxShadow: "1px 1px #1e293b",
          fontWeight: 600,
        }}
        className="bg-white p-3"
        href={href}
      >
        {children}
      </a>
    );
  }

  return (
    <form className={className} method={method} action={action}>
      <button
        type="submit"
        style={{
          border: "2px solid #1e293b",
          boxShadow: "1px 1px #1e293b",
          fontWeight: 600,
        }}
        className="bg-white p-3"
      >
        {children}
      </button>
    </form>
  );
}
