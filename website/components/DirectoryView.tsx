import { Directory } from "./types";
import { HiOutlineDocument, HiFolder } from "react-icons/hi";
import { classNames } from "./utils";
import { useDispatch, useSelector } from "react-redux";
import { RootState, selectNewEntry } from "../store";
import EntryContent from "./EntryContent";

interface Props {
  directory: Directory;
  nestingLevel: number;
  repoOwner: string;
  repoName: string;
}

function EntryIcon({ type }: { type: string }) {
  if (type === "blob") {
    return <HiOutlineDocument />;
  }

  return <HiFolder />;
}

export default function DirectoryView({
  directory,
  nestingLevel,
  repoOwner,
  repoName,
}: Props) {
  const openFileIndex = useSelector((state: RootState) =>
    nestingLevel < state.repo.selectedEntries.length
      ? state.repo.selectedEntries[nestingLevel].index
      : 0
  );
  const selectedDirectory = useSelector(
    (state: RootState) => state.repo.selectedDirectory
  );
  const dispatch = useDispatch();

  return (
    <div className="flex">
      <ul
        className={classNames(
          "space-y-2 p-10",
          selectedDirectory === nestingLevel && "bg-slate-200"
        )}
      >
        {directory.object.entries.map((file, index) => (
          <li
            onClick={() => {
              dispatch(
                selectNewEntry({
                  directoryIndex: nestingLevel,
                  newEntryIndex: index,
                  length: directory.object.entries.length,
                  isDirectory: directory.object.entries[index].type === "tree",
                })
              );
            }}
            className={classNames(
              "flex items-center p-2",
              file.name === directory.object.entries[openFileIndex]?.name &&
                "bg-cyan-100"
            )}
            key={file.name}
          >
            <EntryIcon type={file.type} />
            <span className="pl-3">{file.name}</span>
          </li>
        ))}
      </ul>
      <div className="flex">
        {openFileIndex !== undefined && (
          <EntryContent
            nestingLevel={nestingLevel}
            repoOwner={repoOwner}
            repoName={repoName}
            file={directory.object.entries[openFileIndex]}
          />
        )}
      </div>
    </div>
  );
}
