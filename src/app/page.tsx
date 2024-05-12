import Head from "next/head";
import { SignIn } from "./components/sign-in";

type ConnectionStatus = {
  isConnected: boolean;
};

export default async function Home() {
  return (
    <>
      <Head>
        <title>CoupleCents</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-gray-100 flex">
        <div className="px-8 py-12 max-w-md mx-auto sm:max-w-xl lg:max-w-full lg:w-1/2 lg:py-24 lg:px-12">
          <div>
            <h1>Couple Cents App</h1>
          </div>
          <div>
            <p className="description">
              Application to manage your personal finances.
            </p>
          </div>
          <div>
            <SignIn />
          </div>
        </div>
      </div>
    </>
  );
}
