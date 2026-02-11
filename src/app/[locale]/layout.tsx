import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import "./globals.css";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleRefresher } from "./locale-refresher";
import { getUserPreferredLocale } from "@/app/lib/session-utils";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "CoupleCents App",
  description: "CoupleCents app that helps with personal finances.",
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Fetch user's preferred locale from database
  // If user is authenticated, use their saved locale
  // Otherwise falls back to middleware-provided locale
  const userPreferredLocale = await getUserPreferredLocale();

  return (
    <html lang="en">
      <body className="bg-white">
        <NextIntlClientProvider locale={userPreferredLocale}>
          <LocaleRefresher />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
