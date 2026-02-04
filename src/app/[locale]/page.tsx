"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import logo from "@public/logo.png";
import CreditCards from "@public/credit_cards.jpeg";
import Bench from "@public/bench_2.jpeg";
import { SignInWithGitHub } from "../components/auth/sign-in-github";
import SignUp from "../components/auth/sign-up";
import LoginForm from "../components/auth/sign-in-email";
import { featureFlags } from "../lib/featureflags";
import { SignInWithGoogle } from "../components/auth/sign-in-google";
import Head from "next/head";

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

      <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition-colors duration-300">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8">
                <Image src={logo} alt="Logo" width={32} height={32} />
              </div>
              <h2 className="text-gray-900 dark:text-white text-xl font-extrabold tracking-tight">
                {t("title")}
              </h2>
            </div>
            <nav className="hidden md:flex items-center gap-10">
              <a
                className="text-sm font-semibold hover:text-secondary transition-colors"
                href="#features"
              >
                {t("features")}
              </a>
              <a
                className="text-sm font-semibold hover:text-secondary transition-colors"
                href="#security"
              >
                {t("security")}
              </a>
              <a
                className="text-sm font-semibold hover:text-secondary transition-colors"
                href="#support"
              >
                {t("support")}
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <a
                href="#login"
                className="hidden sm:flex h-11 px-6 items-center justify-center rounded-lg bg-primary-600 text-secondary text-sm font-bold hover:shadow-lg hover:shadow-secondary/20 transition-all"
              >
                {t("getStarted")}
              </a>
            </div>
          </div>
        </header>

        <main>
          {/* Split Hero Section */}
          <section className="relative min-h-[90vh] flex items-center overflow-hidden py-12 md:py-20 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: Content */}
              <div className="flex flex-col gap-8 z-10">
                <div className="flex flex-col gap-4">
                  <span className="text-secondary font-bold tracking-widest uppercase text-xs">
                    {t("subtitle")}
                  </span>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tighter text-gray-900 dark:text-white">
                    {t("titleWallet")}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-lg font-medium leading-relaxed">
                    {t("walletDescription")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  {/* <button className="h-14 px-8 rounded-xl bg-secondary text-gray-900 font-bold text-lg hover:bg-opacity-90 transition-colors">
                    {t("getStartedButton")}
                  </button>
                  <button className="h-14 px-8 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    {t("viewDemo")}
                  </button> */}
                </div>
              </div>

              {/* Right: Visual & Auth Card */}
              <div
                id="login"
                className="relative w-full aspect-square lg:aspect-auto lg:h-[700px]"
              >
                {/* Background Hero Image */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/40 to-transparent z-10"></div>
                  <div className="w-full h-full bg-cover bg-center">
                    <Image
                      src={CreditCards}
                      alt={t("altTextImage1")}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Floating Auth Card */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 w-[90%] md:w-[400px] z-20">
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-200 dark:border-gray-700 backdrop-blur-xl">
                    <div className="flex flex-col gap-6">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                          {t("loginTitle")}
                        </h3>
                      </div>

                      {/* Auth Content */}
                      <div className="space-y-4">
                        {isSignUp && featureFlags.signUp ? (
                          <SignUp />
                        ) : (
                          <>
                            {featureFlags.signUp ? (
                              <div className="space-y-4">
                                <LoginForm />
                                <div className="relative">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                  </div>
                                  <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-slate-800 text-gray-500">
                                      {tLogin("or")}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm text-center">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {tLogin("areYouNew")}{" "}
                                  </span>
                                  <button
                                    onClick={() => setIsSignUp(true)}
                                    className="text-secondary hover:opacity-80 font-semibold transition-opacity"
                                  >
                                    {tSignUp("newAccount")}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {featureFlags.googleSignIn && (
                                  <SignInWithGoogle />
                                )}
                                <SignInWithGitHub />
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Terms */}
                      <div className="flex flex-col gap-4">
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                          {t("bySigningIn")}{" "}
                          <a
                            href="/terms"
                            className="text-secondary hover:opacity-80 underline transition-opacity"
                          >
                            {t("termsOfService")}
                          </a>{" "}
                          {t("and")}{" "}
                          <a
                            href="/privacy"
                            className="text-secondary hover:opacity-80 underline transition-opacity"
                          >
                            {t("privacyPolicy")}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section
            id="features"
            className="py-32 bg-gray-50 dark:bg-slate-800/50"
          >
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row gap-16 lg:items-end mb-20">
                <div className="max-w-2xl space-y-6">
                  <span className="text-secondary font-bold tracking-widest uppercase text-xs">
                    {t("vision")}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                    {t("section2Title")}
                  </h2>
                </div>
                <div className="lg:mb-2 flex-1">
                  <p className="text-xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed border-l-4 border-secondary pl-8">
                    {t("section2Description")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature Card 1 */}
                <div className="group p-10 rounded-2xl bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-gray-600 hover:border-secondary/30 transition-all duration-500 hover:shadow-lg">
                  <div className="text-5xl mb-8">💎</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    {t("feature1Title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {t("feature1Description")}
                  </p>
                </div>

                {/* Feature Card 2 */}
                <div className="group p-10 rounded-2xl bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-gray-600 hover:border-secondary/30 transition-all duration-500 hover:shadow-lg">
                  <div className="text-5xl mb-8">📈</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    {t("feature2Title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {t("feature2Description")}
                  </p>
                </div>

                {/* Feature Card 3 */}
                <div className="group p-10 rounded-2xl bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-gray-600 hover:border-secondary/30 transition-all duration-500 hover:shadow-lg">
                  <div className="text-5xl mb-8">❤️</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    {t("feature3Title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {t("feature3Description")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Image Section */}
          <section className="hidden lg:flex flex-row py-20 bg-white dark:bg-slate-900">
            <div className="w-1/2 flex items-center justify-center px-12">
              <div className="w-full relative h-96">
                <Image
                  src={Bench}
                  alt={t("altTextImage2")}
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>
            </div>
            <div className="w-1/2 flex items-center px-12">
              <div>
                <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-6">
                  {t("section3Title")}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t("section3Description")}
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-12 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 opacity-70">
              <span className="text-sm font-bold">
                © {new Date().getFullYear()} {t("footerText")}{" "}
                <a
                  className="underline text-secondary hover:opacity-80 transition-opacity"
                  href="https://github.com/egarcia-p/couple-cents"
                >
                  {t("githubLinkText")}
                </a>{" "}
                {t("repositoryLinkText")}
              </span>
            </div>
            <div className="flex gap-8">
              <a
                className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-secondary transition-colors"
                href="/privacy"
              >
                {t("privacyPolicy")}
              </a>
              <a
                className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-secondary transition-colors"
                href="/terms"
              >
                {t("termsOfService")}
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
