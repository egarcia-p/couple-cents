import Head from "next/head";
import { SignIn } from "./components/sign-in";

type ConnectionStatus = {
  isConnected: boolean;
};

export default async function Home() {
  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Couple Cents App</h1>
        <p className="description">
          Application to manage your personal finances.
        </p>
        <SignIn />
      </main>
    </div>
  );
}
