import Head from "next/head";
import { SignIn } from "./components/sign-in";
import logo from "../../public/logo.svg";
import CreditCards from "../../public/credit_cards.jpeg";
import Bench from "../../public/bench_2.jpeg";
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
      <div id="top" className=" h-32 flex"></div>

      <div className="flex flex-row">
        <div className=" bg-primary-600 text-secondary pl-12 pr-8 py-12 max-w-md mx-auto gap-2 sm:max-w-xl lg:max-w-full lg:w-1/2 lg:py-24 lg:pl-64 lg:pr-12 lg:rounded-r-lg">
          <div className="w-48    text-white md:w-80">
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

      <div className="flex flex-row my-20">
        <div className="w-1/2 flex px-8 py-12 sm:max-w-xl lg:max-w-full lg:w-1/2 lg:py-24 lg:px-16 lg:rounded-r-lg">
          <div className="h-[32rem] mx-14 w-full m-auto items-center overflow-hidden">
            <Image
              className=" w-full object-cover"
              src={CreditCards}
              alt="Credit cards"
            />
          </div>
        </div>
        <div
          id="left"
          className="text-black px-8 py-12 max-w-md mx-auto gap-2 w-1/4 sm:max-w-xl lg:max-w-full lg:w-1/2 lg:py-24 lg:px-16 lg:rounded-r-lg"
        >
          <div className="p-8 border-t-black border-t">
            <h1 className="text-6xl">Take control of your finances</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-row my-20">
        <div
          id="left"
          className="  text-secondary py-12 max-w-md mx-auto gap-2 sm:max-w-xl lg:max-w-full lg:w-1/2 lg:py-24  lg:rounded-r-lg"
        >
          <div className="absolute px-8 bg-primary-600 overflow-auto -mr-16 sm:max-w-xl lg:max-w-full lg:w-1/2 lg:py-24  lg:rounded-r-lg">
            <h1 className="text-6xl ">Make the most of your money</h1>
          </div>
        </div>
        <div className="w-[96rem] flex ">
          <div className="h-[54rem] w-full m-auto items-center overflow-hidden">
            <Image
              className="w-full object-cover"
              src={Bench}
              alt="Credit cards"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row my-20 items-center justify-center">
        <div className="flex">
          <p className="text-xl text-justify">
            © 2024 CoupleCents App. This project is licensed under the MIT -
            see the LICENSE file for details. For contributions and support,
            visit our GitHub repository.
          </p>
        </div>
      </div>
    </>
  );
}
