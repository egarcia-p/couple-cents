"use client";

import { useEffect } from "react";
import { authClient } from "@/app/lib/auth-client";

/**
 * Hook to refresh user locale from database
 * Fetches user's language preference and sets NEXT_LOCALE cookie
 * Should be called in root layout or early in the app
 */
export function useRefreshUserLocale() {
  const session = authClient.useSession();

  useEffect(() => {
    if (session.data?.user?.id) {
      // Call API to refresh locale cookie from database
      fetch("/api/user/locale").catch((error) => {
        console.error("Failed to refresh user locale:", error);
      });
    }
  }, [session.data?.user?.id]);
}
