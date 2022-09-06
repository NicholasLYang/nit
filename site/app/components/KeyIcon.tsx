import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  className?: string;
}

export default function KeyIcon({ children, className }: Props) {
  return (
    <kbd
      style={{
        border: "2px solid #1e293b",
        boxShadow: "1px 1px #1e293b",
        fontSize: ".85em",
        lineHeight: ".85em",
        display: "inline-block",
        fontWeight: 600,
        letterSpacing: ".05em",
        padding: "3px 5px",
        whiteSpace: "nowrap",
      }}
      className={className}
    >
      {children}
    </kbd>
  );
}
