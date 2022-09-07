import KeyIcon from "~/components/KeyIcon";

export function ListCommands({ backTo }: { backTo: string }) {
  return (
    <div className="space-x-7 pb-5">
      <span>
        <KeyIcon>h</KeyIcon> Back to {backTo}
      </span>
      <span>
        <KeyIcon>k</KeyIcon> Next item
      </span>
      <span>
        <KeyIcon>j</KeyIcon> Previous item
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
