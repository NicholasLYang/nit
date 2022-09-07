import KeyIcon from "~/components/KeyIcon";
import { useHotkeys } from "react-hotkeys-hook";
import { useState } from "react";
import Box from "~/components/Box";
import { useLocation, useSubmit } from "@remix-run/react";

export default function FeedbackPage() {
  const [isEmailCopied, setIsEmailCopied] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const submit = useSubmit();

  useHotkeys("h", () => {
    submit(null, { method: "get", action: queryParams.get("from") || "/" });
  });

  useHotkeys("t", () => {
    window.location.href = "https://twitter.com/nicholaslyang";
  });

  useHotkeys("m", () => {
    navigator.clipboard.writeText("nick@nicholasyang.com").then(() => {
      setIsEmailCopied(true);
    });
  });

  useHotkeys("i", () => {
    window.location.href = "https://github.com/nicholaslyang/nit/issues/new";
  });

  return (
    <div className="flex flex-col items-center p-6 text-left">
      <h1 className="text-2xl font-semibold">Feedback</h1>
      <div className="ml-16 self-start">
        <KeyIcon>h</KeyIcon> Go back
      </div>
      <div className="p-3">
        If you have any feedback, let me know! I'll do my best to fix any issues
        or confusing behavior as soon as possible.
      </div>
      <div className="space-x-5">
        <KeyIcon>t</KeyIcon> Tweet @nicholaslyang
        <KeyIcon>m</KeyIcon> Email nick@nicholasyang.com
        <KeyIcon>i</KeyIcon> Open an issue on GitHub
      </div>
      {isEmailCopied && (
        <Box className="m-5 p-3">
          Copied email! Nope, no mailto links. Who likes those?
        </Box>
      )}
    </div>
  );
}
