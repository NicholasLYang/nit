import { TimelineEventType } from "~/types";
import sanitizeHtml from "sanitize-html";

interface Props {
  type: TimelineEventType;
  payload: any;
}

export default function TimelineItem({ type, payload }: Props) {
  switch (type) {
    case "AssignedEvent":
      return (
        <li>
          {payload.actor?.login ?? "ghost"} assigned {payload.assignee.login}
        </li>
      );
    case "ClosedEvent":
      let reason: string = {
        COMPLETED: "completed",
        NOT_PLANNED: "not planned",
        REOPENED: "reopened",
      }[payload.stateReason as "COMPLETED" | "NOT_PLANNED" | "REOPENED"];

      return (
        <li>
          {payload.actor?.login ?? "ghost"} closed this as {reason}
        </li>
      );
    case "CrossReferencedEvent":
      return (
        <li>
          <span>{payload.actor?.login ?? "ghost"} mentioned this issue</span>
          <h3
            className="text-lg font-semibold"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(payload.source.titleHTML),
            }}
          />
        </li>
      );
    case "IssueComment":
      return (
        <li className="box p-4 py-5 md:min-w-[100px]">
          <h3 className="py-2 font-semibold">{payload.author.login}</h3>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(payload.bodyHTML) }}
          />
        </li>
      );
    case "LabeledEvent":
      return (
        <li className="flex items-center">
          {payload.actor.login} added
          <div
            style={{ backgroundColor: `#${payload.label.color}` }}
            className="mx-2 flex items-center justify-center rounded-xl p-2 text-xs"
          >
            {payload.label.name}
          </div>
        </li>
      );
    default:
      console.error(`Not implemented yet: ${type}`);
      console.error(payload);
      return (
        <li>
          <div>{type}</div>
        </li>
      );
  }
}
