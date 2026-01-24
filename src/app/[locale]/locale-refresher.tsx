"use client";

import { useEffect } from "react";
import { authClient } from "@/app/lib/auth-client";

/**
 * Client component that refreshes user locale from database
 * Fetches user's language preference and updates NEXT_LOCALE cookie
 */
export function LocaleRefresher() {
  const session = authClient.useSession();

  useEffect(() => {
    if (session.data?.user?.id) {
      // Call API to refresh locale cookie from database
      fetch("/api/user/locale").catch((error) => {
        console.error("Failed to refresh user locale:", error);
      });
    }
  }, [session.data?.user?.id]);

  return null;
}
