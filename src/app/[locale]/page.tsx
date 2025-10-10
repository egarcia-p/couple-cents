"use client";

import Head from "next/head";
import logo from "@public/logo.svg";
import CreditCards from "@public/credit_cards.jpeg";
import Bench from "@public/bench_2.jpeg";
import Image from "next/image";
import { SignInWithGitHub } from "../components/auth/sign-in-github";
import SignUp from "../components/auth/sign-up";
import LoginForm from "../components/auth/sign-in-email";
import { useState } from "react";
import { is } from "drizzle-orm";
import messagesAuth from "@/app/lib/data/messages/auth.json";
import { featureFlags } from "../lib/featureflags";
import { SignInWithGoogle } from "../components/auth/sign-in-google";
import { useTranslations } from "next-intl";

type ConnectionStatus = {
  isConnected: boolean;
};

export default function Home() {
  const t = useTranslations("HomePage");
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <>
      <Head>
        <title>{t("title")}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div id="top" className="sm:h16 lg:h-32 flex"></div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className=" bg-primary-600 text-secondary pl-12 pr-8 py-12 w-full max-w-md mx-auto gap-2 sm:max-w-xl lg:max-w-full lg:w-1/2 lg:py-24 lg:pl-64 lg:pr-12 lg:rounded-r-lg">
          <div className="w-48 text-white md:w-80">
            <Image src={logo} alt="Logo" width={0} height={0} />
          </div>
          <div>
            <h1 className="text-4xl">{t("titleWallet")}</h1>
          </div>
          <div>
            <p className="text-xl">
              Financial Tool for Individuals and Couples
            </p>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex">
          <div className="m-auto items-center ">
            {isSignUp && featureFlags.signUp ? (
              <SignUp />
            ) : (
              <div>
                {featureFlags.signUp ? (
                  <div>
                    <LoginForm />
                    <hr className="my-6 border-t-2 border-t-secondary" />
                    <div className="my-6">
                      <span>{messagesAuth.login.areYouNew} </span>
                      <a
                        onClick={() => setIsSignUp(true)}
                        className="cursor-pointer underline hover:text-primary-300"
                      >
                        {messagesAuth.signup.newAccount}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <SignInWithGitHub />
                    {featureFlags.googleSignIn && <SignInWithGoogle />}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-row gap-4 lg:my-20">
        <div className="w-1/2 flex px-8 py-12 sm:max-w-xl lg:max-w-full lg:w-1/2 lg:py-24 lg:px-16 lg:rounded-r-lg">
          <div className="h-[32rem] mx-14 w-full m-auto items-center overflow-hidden">
            <Image
              className=" w-full object-cover"
              src={CreditCards}
              alt="Credit cards"
              width={0}
              height={0}
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

      <div className="hidden lg:flex flex-row lg:my-20">
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
              width={0}
              height={0}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row my-20 items-center justify-center">
        <div className="flex">
          <p className="text-xl text-justify">
            © {new Date().getFullYear()} CoupleCents App. This project is
            licensed under the Apache license - see the LICENSE file for
            details. For contributions and support, visit our{" "}
            <a
              className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
              href="https://github.com/egarcia-p/couple-cents"
            >
              GitHub
            </a>{" "}
            repository.
          </p>
        </div>
      </div>
    </>
  );
}
