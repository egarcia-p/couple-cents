import { vi } from "vitest";

export const signIn = vi.fn();
export const signOut = vi.fn();
export const useSession = vi.fn(() => ({
  data: null,
  status: "unauthenticated",
}));
