export default function KeyIcon({ children }) {
  return (
    <kbd
      style={{
        borderRadius: "3px",
        padding: "1px 2px 0",
        border: "1px solid black",
        marginRight: "1px",
      }}
    >
      {children}
    </kbd>
  );
}
