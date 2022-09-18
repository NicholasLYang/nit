import client from "~/apollo-client";
import gql from "graphql-tag";
import { Link, useLoaderData, useParams, useSubmit } from "@remix-run/react";
import { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import sanitizeHtml from "sanitize-html";
import { useHotkeys } from "react-hotkeys-hook";
import KeyIcon from "~/components/KeyIcon";
import TimelineItem from "~/components/TimelineItem";

export async function loader({ params, request }: LoaderArgs) {
  const { accessToken } = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const { data } = await client.query({
    query: gql`
      query Issue($owner: String!, $name: String!, $id: Int!) {
        repository(owner: $owner, name: $name) {
          issue(number: $id) {
            id
            bodyHTML
            number
            titleHTML
            author {
              login
            }
            timelineItems(first: 30) {
              nodes {
                __typename
                ... on AddedToProjectEvent {
                  actor {
                    login
                  }
                  createdAt
                }
                ... on AssignedEvent {
                  actor {
                    login
                  }
                  assignee {
                    ... on Bot {
                      login
                    }
                    ... on Mannequin {
                      login
                    }
                    ... on User {
                      login
                    }
                    ... on Organization {
                      login
                    }
                  }
                  assignable {
                    __typename
                    ... on Issue {
                      number
                    }
                    ... on PullRequest {
                      number
                    }
                  }
                }
                ... on ClosedEvent {
                  actor {
                    login
                  }
                  stateReason
                }
                ... on CommentDeletedEvent {
                  actor {
                    login
                  }
                }
                ... on ConnectedEvent {
                  actor {
                    login
                  }
                }
                ... on ConvertedNoteToIssueEvent {
                  actor {
                    login
                  }
                }
                ... on CrossReferencedEvent {
                  actor {
                    login
                  }
                  source {
                    __typename
                    ... on Issue {
                      titleHTML
                      number
                    }
                    ... on PullRequest {
                      titleHTML
                      number
                    }
                  }
                }
                ... on DemilestonedEvent {
                  actor {
                    login
                  }
                }
                ... on DisconnectedEvent {
                  actor {
                    login
                  }
                }
                ... on IssueComment {
                  author {
                    login
                  }
                  bodyHTML
                }
                ... on LabeledEvent {
                  actor {
                    login
                  }
                  label {
                    color
                    name
                  }
                }
                ... on ReferencedEvent {
                  actor {
                    login
                  }
                  commit {
                    abbreviatedOid
                    commitUrl
                  }
                  commitRepository {
                    nameWithOwner
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      owner: params.owner,
      name: params.name,
      id: parseInt(params.issueId!),
    },
    context: { headers: { Authorization: `token ${accessToken}` } },
  });

  return {
    issue: data.repository.issue,
  };
}

export default function IssuePage() {
  const { issue } = useLoaderData();
  const { owner, name } = useParams();
  const submit = useSubmit();

  useHotkeys("h", () => {
    submit(null, { method: "get", action: `/${owner}/${name}/issues` });
  });
  useHotkeys("j", () => {
    window.scrollBy({ top: window.innerHeight, left: 0, behavior: "smooth" });
  });
  useHotkeys("k", () => {
    window.scrollBy({ top: -window.innerHeight, left: 0, behavior: "smooth" });
  });

  return (
    <div className="flex w-3/4 max-w-5xl grow flex-col items-center">
      <div className="space-x-5">
        <span>
          <KeyIcon>h</KeyIcon> Go back
        </span>
        <span>
          <KeyIcon>j</KeyIcon> Scroll down
        </span>
        <span>
          <KeyIcon>k</KeyIcon> Scroll up
        </span>
      </div>
      <div className="pt-16 pb-8">
        <h1
          className="prose text-3xl font-bold"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(issue.titleHTML) }}
        />
        <h2 className="text-lg">
          <Link to={`/${issue.author.login}`}>{issue.author.login}</Link>
        </h2>
      </div>
      <div
        className="box prose w-full whitespace-normal p-5 font-normal"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(issue.bodyHTML) }}
      />
      <ul className="flex flex-col space-y-5 whitespace-normal p-5 font-normal">
        {issue.timelineItems.nodes.filter(isDisplayedEvent).map((item) => (
          <TimelineItem type={item.__typename} payload={item} />
        ))}
      </ul>
    </div>
  );
}

function isDisplayedEvent(event: { __typename: string }): boolean {
  switch (event.__typename) {
    case "MentionedEvent":
    case "SubscribedEvent":
      return false;
    default:
      return true;
  }
}
