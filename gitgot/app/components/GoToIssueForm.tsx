import { useEffect, useRef } from "react";
import { useParams, useSearchParams, useSubmit } from "@remix-run/react";
import KeyIcon from "~/components/KeyIcon";
import { addGlobalKeyCommands } from "~/key-commands";

export function GoToIssueForm() {
  const [_, setSearchParams] = useSearchParams();
  const goToIssueRef = useRef<HTMLInputElement | null>(null);
  const { owner, name } = useParams();
  const submit = useSubmit();

  useEffect(() => {
    if (goToIssueRef.current) {
      goToIssueRef.current.focus();
      goToIssueRef.current?.addEventListener("keydown", (event) => {
        if (event.metaKey && event.key === "i") {
          setSearchParams({ state: "default" });
        }
      });
      addGlobalKeyCommands(goToIssueRef.current, submit);
    }
  }, [goToIssueRef]);

  return (
    <form
      method="post"
      action={`/${owner}/${name}/issues?index`}
      className="flex flex-col space-y-5 py-3"
    >
      <span>
        <KeyIcon>&#8984;I</KeyIcon> Go back
      </span>
      <span className="space-x-2">
        <label>Go to</label>
        <input
          name="issueNumber"
          type="text"
          placeholder="Issue Number"
          pattern="\d+"
          ref={goToIssueRef}
        />
        <button type="submit">
          <KeyIcon>ENTER</KeyIcon>
        </button>
      </span>
    </form>
  );
}
