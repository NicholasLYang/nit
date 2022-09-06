export default function Box({ children, ...props }) {
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
