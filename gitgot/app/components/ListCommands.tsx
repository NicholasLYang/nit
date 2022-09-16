import KeyIcon from "~/components/KeyIcon";

export function ListCommands() {
  return (
    <div className="space-x-7 pb-5">
      <span>
        <KeyIcon>j</KeyIcon> Next item
      </span>
      <span>
        <KeyIcon>k</KeyIcon> Previous item
      </span>
      <span>
        <KeyIcon>SPACE</KeyIcon> Preview content
      </span>
      <span>
        <KeyIcon>ENTER</KeyIcon> Select item
      </span>
    </div>
  );
}
