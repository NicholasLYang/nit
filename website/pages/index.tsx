import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import Parser from "web-tree-sitter";
import { classNames } from "../components/utils";
import { useRouter } from "next/router";

// enum LoadingState {
//   Loading,
//   Done,
//   Error,
// }
//
// type ParserState =
//   | { loadingState: LoadingState.Loading }
//   | { loadingState: LoadingState.Done; parser: Parser }
//   | { loadingState: LoadingState.Error; error: Error };

enum ActionType {
  Search = "search",
  Open = "repo",
  About = "about",
}

function Home() {
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");

  const handleSubmit = useCallback(() => {});
  return (
    <div>
      <Head>
        <title>Nit: No nonsense GitHub</title>
        <meta
          name="description"
          content="Nit, a no-nonsense GitHub front end"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="p-2">
        <div>Enter repository owner and name</div>
        <div>Press enter to go</div>
        <form onSubmit={handleSubmit} className="space-x-2 p-2">
          <input type="text" value={owner} placeholder="facebook" />
          <input type="text" value={repoName} placeholder="react" />l
        </form>
      </main>
    </div>
  );
}

export default Home;
