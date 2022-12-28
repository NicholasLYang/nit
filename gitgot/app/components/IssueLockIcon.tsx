import { DecryptionStatus } from "~/types";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";

export default function IssueLockIcon({ status }) {
  if (status === DecryptionStatus.MySecret) {
    return <LockOpenIcon className="w-6" />;
  } else if (status === DecryptionStatus.NotMySecret) {
    return <LockClosedIcon className="w-6" />;
  }
  return null;
}
