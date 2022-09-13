import KeyIcon from "~/components/KeyIcon";
import { useHotkeys } from "react-hotkeys-hook";
import { useState } from "react";
import ActionButton from "~/components/ActionButton";

export default function HelpPage() {
  const [hi, setHi] = useState(false);

  useHotkeys("h", () => {
    setHi(true);
  });
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h1 className="py-3 text-2xl font-bold">Welcome to gitgot</h1>
      <div className="max-w-md space-y-5">
        <p>
          gitgot is a dialed-in GitHub user interfaces. It lets you use GitHub
          extremely quickly and efficiently.
        </p>
        <p>
          gitgot is designed to be used entirely via keyboard commands. When you
          see a key icon followed by some text, pressing that key triggers the
          command described by the text:
        </p>
        <div className="bg-slate-200 p-5">
          <KeyIcon>h</KeyIcon> Say hi
        </div>
        {hi && <div className="bg-sky-200 p-5">Hi! Welcome to gitgot</div>}
        <p>
          Keyboard commands can also show up as larger blocks. These tend to be
          more general purpose and use the Command or Windows key. This are also
          clickable in case you don't like key commands.
        </p>
        <div className="bg-slate-200 py-5">
          <ActionButton
            className="flex items-center px-5"
            method="get"
            action="/"
          >
            Go Home <span className="text-slate-400">&#8984;I</span>
          </ActionButton>
        </div>
        <p>
          If this all makes sense to you, then go ahead, use the command above
          to go to the home page. If it doesn't make sense, then{" "}
          <a
            className="text-blue-600 visited:text-purple-600"
            href="https://github.com/nicholaslyang/nit/issues/new"
          >
            click here
          </a>{" "}
          to tell me.
        </p>
      </div>
    </div>
  );
}
