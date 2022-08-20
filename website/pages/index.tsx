import Head from "next/head";
import styles from "../styles/Home.module.css";

function Home() {
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
    </div>
  );
}

export default Home;
