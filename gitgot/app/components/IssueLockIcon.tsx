import { DecryptionStatus } from "~/types";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import { classNames } from "~/utils";

export default function IssueLockIcon({ status, className }) {
  if (status === DecryptionStatus.MySecret) {
    return <LockOpenIcon className={classNames("w-6", className)} />;
  } else if (status === DecryptionStatus.NotMySecret) {
    return <LockClosedIcon className={classNames("w-6", className)} />;
  }
  return null;
}
