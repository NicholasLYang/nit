import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import Parser from "web-tree-sitter";

enum LoadingState {
  Loading,
  Done,
  Error,
}

type ParserState =
  | { loadingState: LoadingState.Loading }
  | { loadingState: LoadingState.Done; parser: Parser }
  | { loadingState: LoadingState.Error; error: Error };

function Home() {
  const [code, setCode] = useState("");
  const [parserState, setParserState] = useState<ParserState>({
    loadingState: LoadingState.Loading,
  });

  useEffect(() => {
    async function run() {
      await Parser.init({
        locateFile(path: string) {
          return path;
        },
      });
      const parser = new Parser();
      const result = await fetch("/tree-sitter-rust.wasm");
      const rustBytes = new Uint8Array(await result.arrayBuffer());
      const Rust = await Parser.Language.load(rustBytes);
      parser.setLanguage(Rust);
      setParserState({ loadingState: LoadingState.Done, parser });
    }

    run();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Nit: Refactor Code Quickly</title>
        <meta name="description" content="Nit, a no-code editor for code" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Refactor Code Quickly</h1>
      </main>
      {parserState.loadingState === LoadingState.Done && (
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <pre>{parserState.parser.parse(code).rootNode.toString()}</pre>
        </div>
      )}
    </div>
  );
}

export default Home;
