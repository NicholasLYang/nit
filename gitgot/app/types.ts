import { Maybe } from "graphql/jsutils/Maybe";

export interface Issue {
  id: string;
  number: number;
  titleHTML: string;
  bodyHTML: string;
}

export interface PullRequest {
  id: string;
  number: number;
  titleHTML: string;
  bodyHTML: string;
}

export interface HomePageRepositories {
  recentlyVisited: string[];
  pinned: string[];
}

export type TimelineEventType =
  | "AddedToProjectEvent"
  | "AssignedEvent"
  | "ClosedEvent"
  | "CommentDeletedEvent"
  | "ConnectedEvent"
  | "ConvertedNoteToIssueEvent"
  | "ConvertedToDiscussionEvent"
  | "CrossReferencedEvent"
  | "DemilestonedEvent"
  | "DisconnectedEvent"
  | "IssueComment"
  | "LabeledEvent"
  | "LockedEvent"
  | "MarkedAsDuplicateEvent"
  | "MentionedEvent"
  | "MilestonedEvent"
  | "MovedColumnsInProjectEvent"
  | "PinnedEvent"
  | "ReferencedEvent"
  | "RemovedFromProjectEvent"
  | "RenamedTitleEvent"
  | "ReopenedEvent"
  | "SubscribedEvent"
  | "TransferredEvent"
  | "UnassignedEvent"
  | "UnlabeledEvent"
  | "UnlockedEvent"
  | "UnmarkedAsDuplicateEvent"
  | "UnpinnedEvent"
  | "UnsubscribedEvent"
  | "UserBlockedEvent";

interface ProjectCard {}

/** Represents a 'added_to_project' event on a given issue or pull request. */
export type AddedToProjectEvent = Node & {
  __typename?: "AddedToProjectEvent";
  /** Identifies the actor who performed the event. */
  actor?: Maybe<{ login: string }>;
  /** Identifies the date and time when the object was created. */
  createdAt: string;
  /** Identifies the primary key from the database. */
  databaseId?: Maybe<number>;
  id: string;
  /** Project card referenced by this project event. */
  projectCard?: Maybe<ProjectCard>;
  /** Column name referenced by this project event. */
  projectColumnName: string;
};

// export type IssueTimelineItems =
//   | AddedToProjectEvent
//   | AssignedEvent
//   | ClosedEvent
//   | CommentDeletedEvent
//   | ConnectedEvent
//   | ConvertedNoteToIssueEvent
//   | ConvertedToDiscussionEvent
//   | CrossReferencedEvent
//   | DemilestonedEvent
//   | DisconnectedEvent
//   | IssueComment
//   | LabeledEvent
//   | LockedEvent
//   | MarkedAsDuplicateEvent
//   | MentionedEvent
//   | MilestonedEvent
//   | MovedColumnsInProjectEvent
//   | PinnedEvent
//   | ReferencedEvent
//   | RemovedFromProjectEvent
//   | RenamedTitleEvent
//   | ReopenedEvent
//   | SubscribedEvent
//   | TransferredEvent
//   | UnassignedEvent
//   | UnlabeledEvent
//   | UnlockedEvent
//   | UnmarkedAsDuplicateEvent
//   | UnpinnedEvent
//   | UnsubscribedEvent
//   | UserBlockedEvent;
