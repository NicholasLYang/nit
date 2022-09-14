import { TimelineEventType } from "~/types";
import sanitizeHtml from "sanitize-html";

interface Props {
  type: TimelineEventType;
  payload: any;
}

export default function TimelineItem({ type, payload }: Props) {
  switch (type) {
    case "CrossReferencedEvent":
      return (
        <li>
          <span>{payload.actor.login} mentioned this issue</span>
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
        <li className="box p-4 py-5">
          <h3 className="py-2 font-semibold">{payload.author.login}</h3>
          <div
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