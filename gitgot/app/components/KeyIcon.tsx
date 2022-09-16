import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
  className?: string;
}

export default function KeyIcon({ children, className }: Props) {
  return <kbd className={`key-icon ${className}`}>{children}</kbd>;
}
