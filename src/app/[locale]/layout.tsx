import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import "./globals.css";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleRefresher } from "./locale-refresher";
import {
  getUserPreferredLocale,
  getUserPreferredTheme,
} from "@/app/lib/session-utils";
import { ThemeProvider } from "@/app/components/theme/theme-provider";
import { MuiThemeProvider } from "@/app/components/theme/mui-theme-provider";

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
  const userPreferredTheme = await getUserPreferredTheme();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider initialTheme={userPreferredTheme}>
          <MuiThemeProvider>
            <NextIntlClientProvider locale={userPreferredLocale}>
              <LocaleRefresher />
              {children}
            </NextIntlClientProvider>
          </MuiThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
