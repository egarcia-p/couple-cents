import Head from "next/head";
import { getServerSideProps } from "./lib/data";
import { SignIn } from "./components/sign-in";

type ConnectionStatus = {
  isConnected: boolean;
};

export default async function Home() {
  const { isConnected } = await getServerSideProps();

  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Couple Cents App</h1>
        {isConnected ? (
          <h2 className="subtitle">You are connected to PostgresDB</h2>
        ) : (
          <h2 className="subtitle">
            You are NOT connected to MongoDB. Check the <code>README.md</code>{" "}
            for instructions.
          </h2>
        )}
        <p className="description">
          Application to manage your personal finances.
        </p>
        <SignIn />
      </main>
    </div>
  );
}
