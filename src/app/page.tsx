import Head from "next/head";
import { SignIn } from "./components/sign-in";
import logo from "../../public/logo.svg";
import Image from "next/image";

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
      <div className=" h-32 flex"></div>

      <div className="flex flex-row">
        <div className=" bg-primary-600 text-secondary pl-12 pr-8 py-12 max-w-md mx-auto gap-2 sm:max-w-xl lg:max-w-full lg:w-1/2 lg:py-24 lg:pl-64 lg:pr-12 lg:rounded-r-lg">
          <div className="w-48   text-white md:w-80">
            <Image src={logo} alt="Logo" />
          </div>
          <div>
            <h1 className="text-4xl">Couple Cents App</h1>
          </div>
          <div>
            <p className="text-xl">
              Financial Tool for Individuals and Couples
            </p>
          </div>
        </div>
        <div className="w-1/2 flex">
          <div className="m-auto items-center ">
            <SignIn />
          </div>
        </div>
      </div>
    </>
  );
}
