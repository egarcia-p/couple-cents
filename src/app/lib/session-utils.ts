import { auth } from "./auth";
import { headers, cookies } from "next/headers";
import { db } from "./db";
import { userSettings } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { fetchUserSettings } from "./data";

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
