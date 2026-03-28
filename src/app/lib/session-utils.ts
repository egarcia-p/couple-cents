import { auth } from "./auth";
import { headers, cookies } from "next/headers";
import { db } from "./db";
import { userSettings } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { fetchUserSettings } from "./data";

import type { Theme } from "@/app/components/theme/theme-provider";

/**
 * Fetches the current user's preferred locale from the userSettings table
 * This is called from Server Components (pages/layouts), not middleware
 * Returns the user's saved locale or the default "en-US" if not authenticated
 */
export async function getUserPreferredLocale(): Promise<string> {
  try {
    // Check NEXT_LOCALE cookie first (set when user saves preferences)
    const cookieStore = await cookies();
    const localeFromCookie = cookieStore.get("NEXT_LOCALE")?.value;
    if (localeFromCookie) {
      return localeFromCookie;
    }

    // Get the current session to retrieve user ID
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return "en-US";
    }

    // Fetch user settings from the database
    const userSetting = await fetchUserSettings(session.user.id);

    // Return user's saved locale from settings or default
    if (userSetting.length > 0 && userSetting[0].language) {
      return userSetting[0].language;
    }

    return "en-US";
  } catch (error) {
    // If not authenticated or error, return default
    return "en-US";
  }
}

/**
 * Fetches the current user's preferred theme from the cookie or userSettings table.
 * Returns "system" as default if not authenticated or no preference is set.
 */
export async function getUserPreferredTheme(): Promise<Theme> {
  try {
    const cookieStore = await cookies();
    const themeFromCookie = cookieStore.get("NEXT_THEME")?.value;
    if (
      themeFromCookie &&
      ["light", "dark", "system"].includes(themeFromCookie)
    ) {
      return themeFromCookie as Theme;
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return "system";
    }

    const userSetting = await fetchUserSettings(session.user.id);

    if (userSetting.length > 0 && userSetting[0].theme) {
      return userSetting[0].theme as Theme;
    }

    return "system";
  } catch (error) {
    return "system";
  }
}
