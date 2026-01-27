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
import { featureFlags } from "../lib/featureflags";
import { SignInWithGoogle } from "../components/auth/sign-in-google";
import { useTranslations } from "next-intl";

type ConnectionStatus = {
  isConnected: boolean;
};

export default function Home() {
  const t = useTranslations("HomePage");
  const tSignUp = useTranslations("SignUpComponent");
  const tLogin = useTranslations("LoginComponent");
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <>
      <Head>
        <title>{t("title")}</title>
        <link
          key="apple-touch-icon-57x57"
          rel="apple-touch-icon"
          sizes="57x57"
          href="/apple-icon-57x57.png"
        />
        <link
          key="apple-touch-icon-60x60"
          rel="apple-touch-icon"
          sizes="60x60"
          href="/apple-icon-60x60.png"
        />
        <link
          key="apple-touch-icon-72x72"
          rel="apple-touch-icon"
          sizes="72x72"
          href="/apple-icon-72x72.png"
        />
        <link
          key="apple-touch-icon-76x76"
          rel="apple-touch-icon"
          sizes="76x76"
          href="/apple-icon-76x76.png"
        />
        <link
          key="apple-touch-icon-114x114"
          rel="apple-touch-icon"
          sizes="114x114"
          href="/apple-icon-114x114.png"
        />
        <link
          key="apple-touch-icon-120x120"
          rel="apple-touch-icon"
          sizes="120x120"
          href="/apple-icon-120x120.png"
        />
        <link
          key="apple-touch-icon-144x144"
          rel="apple-touch-icon"
          sizes="144x144"
          href="/apple-icon-144x144.png"
        />
        <link
          key="apple-touch-icon-152x152"
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-icon-152x152.png"
        />
        <link
          key="apple-touch-icon-180x180"
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-icon-180x180.png"
        />
        <link
          key="icon-192x192"
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-icon-192x192.png"
        />
        <link
          key="icon-32x32"
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          key="icon-96x96"
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link
          key="icon-16x16"
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          key="manifest-json-link-tag-key-value-pair-href-value-manifest-json-value"
          rel="manifest"
          href="/manifest.json"
        />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff"></meta>
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
            <p className="text-xl">{t("walletDescription")}</p>
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
                      <span>{tLogin("areYouNew")} </span>
                      <a
                        onClick={() => setIsSignUp(true)}
                        className="cursor-pointer underline hover:text-primary-300"
                      >
                        {tSignUp("newAccount")}
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
              alt={t("altTextImage1")}
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
            <h1 className="text-6xl">{t("section2Title")}</h1>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-row lg:my-20">
        <div
          id="left"
          className="  text-secondary py-12 max-w-md mx-auto gap-2 sm:max-w-xl lg:max-w-full lg:w-1/2 lg:py-24  lg:rounded-r-lg"
        >
          <div className="absolute px-8 bg-primary-600 overflow-auto -mr-16 sm:max-w-xl lg:max-w-full lg:w-1/2 lg:py-24  lg:rounded-r-lg">
            <h1 className="text-6xl ">{t("section3Title")}</h1>
          </div>
        </div>
        <div className="w-[96rem] flex ">
          <div className="h-[54rem] w-full m-auto items-center overflow-hidden">
            <Image
              className="w-full object-cover"
              src={Bench}
              alt={t("altTextImage2")}
              width={0}
              height={0}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 my-20 items-center justify-center">
        <div className="flex">
          <p className="text-xl text-justify">
            © {new Date().getFullYear()} {t("footerText")}{" "}
            <a
              className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
              href="https://github.com/egarcia-p/couple-cents"
            >
              {t("githubLinkText")}
            </a>{" "}
            {t("repositoryLinkText")}.
          </p>
        </div>
        <div className="flex gap-6 text-center">
          <a
            className="text-blue-600 hover:text-blue-800 underline visited:text-purple-600"
            href="https://www.couple-cents.com/terms"
          >
            Terms of Service
          </a>
          <span className="text-gray-400">•</span>
          <a
            className="text-blue-600 hover:text-blue-800 underline visited:text-purple-600"
            href="https://www.couple-cents.com/privacy"
          >
            Privacy Notice
          </a>
        </div>
      </div>
    </>
  );
}
