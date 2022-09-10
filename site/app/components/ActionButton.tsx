import { ReactNode } from "react";

interface Props {
  method: string;
  action: string;
  children: ReactNode;
}

export default function ActionButton({ method, action, children }: Props) {
  return (
    <form className="ml-10" method={method} action={action}>
      <button
        type="submit"
        style={{
          border: "2px solid #1e293b",
          boxShadow: "1px 1px #1e293b",
          fontWeight: 600,
        }}
        className="mt-5 p-3"
      >
        {children}
      </button>
    </form>
  );
}
