import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function Box({ children, ...props }: Props) {
  return (
    <div
      {...props}
      style={{
        border: "2px solid #1e293b",
        boxShadow: "1px 1px #1e293b",
        lineHeight: ".85em",
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
}
