import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";

// ── Mocks shared across all suites ──────────────────────────────────

const mockCookieSet = vi.fn();
const mockCookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      set: mockCookieSet,
      get: mockCookieGet,
    }),
  ),
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(() => Promise.resolve((key: string) => key)),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// DB mock with configurable select results
const mockExecute = vi.fn().mockResolvedValue([]);
const mockLimit = vi.fn().mockReturnValue({ execute: mockExecute });
const mockSelectWhere = vi.fn().mockReturnValue({ limit: mockLimit });
const mockFrom = vi.fn().mockReturnValue({ where: mockSelectWhere });

const mockInsertValues = vi.fn().mockResolvedValue(undefined);
const mockInsert = vi.fn().mockReturnValue({ values: mockInsertValues });

const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
const mockUpdateSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
const mockUpdate = vi.fn().mockReturnValue({ set: mockUpdateSet });

vi.mock("../db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    }),
  },
}));

vi.mock("../data", () => ({
  fetchUserSettings: vi.fn(() => Promise.resolve([])),
}));

vi.mock("../auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(null)),
    },
  },
}));

vi.mock("../helpers/categories", () => ({
  getAllCategoriesMap: vi.fn(() => ({})),
  getTranslatedAllCategoriesMap: vi.fn(() => Promise.resolve({})),
}));

// ─────────────────────────────────────────────────────────────────────
// 1. saveThemeSettings server action
// ─────────────────────────────────────────────────────────────────────
describe("saveThemeSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function callSaveTheme(fields: Record<string, string>) {
    const { saveThemeSettings } = await import("../actions");
    const formData = new FormData();
    for (const [k, v] of Object.entries(fields)) {
      formData.set(k, v);
    }
    return saveThemeSettings({ message: null }, formData);
  }

  it("returns error when userId is missing", async () => {
    const result = await callSaveTheme({ theme: "dark" });
    expect(result.message).toBe("theme.databaseError");
  });

  it("returns error when theme is missing", async () => {
    const result = await callSaveTheme({ userId: "user-1" });
    expect(result.message).toBe("theme.databaseError");
  });

  it("returns error when theme is invalid", async () => {
    const result = await callSaveTheme({ userId: "user-1", theme: "blue" });
    expect(result.message).toBe("theme.databaseError");
  });

  it("inserts new setting when none exists", async () => {
    const { db } = await import("../db");

    const mockValues = vi.fn().mockResolvedValue(undefined);
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any);

    // select returns empty → no existing setting
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    } as any);

    const result = await callSaveTheme({ userId: "user-1", theme: "dark" });

    expect(result.message).toBeNull();
    expect(db.insert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        theme: "dark",
        language: "en-US",
      }),
    );
  });

  it("updates existing setting when one exists", async () => {
    const { db } = await import("../db");

    const mockWhere = vi.fn().mockResolvedValue(undefined);
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
    vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);

    // select returns one row → existing setting
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue([
              { id: 1, userId: "user-1", language: "en-US", timezone: "UTC", theme: "light" },
            ]),
          }),
        }),
      }),
    } as any);

    const result = await callSaveTheme({ userId: "user-1", theme: "dark" });

    expect(result.message).toBeNull();
    expect(db.update).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith({ theme: "dark" });
  });

  it("sets NEXT_THEME cookie on success", async () => {
    const { db } = await import("../db");

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as any);
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    } as any);

    await callSaveTheme({ userId: "user-1", theme: "light" });

    expect(mockCookieSet).toHaveBeenCalledWith("NEXT_THEME", "light", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// 2. getUserPreferredTheme
// ─────────────────────────────────────────────────────────────────────
describe("getUserPreferredTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns theme from NEXT_THEME cookie when present", async () => {
    mockCookieGet.mockImplementation((name: string) => {
      if (name === "NEXT_THEME") return { value: "dark" };
      return undefined;
    });

    const { getUserPreferredTheme } = await import("../session-utils");
    const theme = await getUserPreferredTheme();
    expect(theme).toBe("dark");
  });

  it("returns theme from DB when no cookie but user is logged in", async () => {
    mockCookieGet.mockReturnValue(undefined);

    const { auth } = await import("../auth");
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: { id: "user-1" },
    } as any);

    const { fetchUserSettings } = await import("../data");
    vi.mocked(fetchUserSettings).mockResolvedValue([
      { id: 1, userId: "user-1", language: "en-US", timezone: "UTC", theme: "light" },
    ] as any);

    const { getUserPreferredTheme } = await import("../session-utils");
    const theme = await getUserPreferredTheme();
    expect(theme).toBe("light");
  });

  it("returns 'system' when no cookie and no user session", async () => {
    mockCookieGet.mockReturnValue(undefined);

    const { auth } = await import("../auth");
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const { getUserPreferredTheme } = await import("../session-utils");
    const theme = await getUserPreferredTheme();
    expect(theme).toBe("system");
  });

  it("returns 'system' on error", async () => {
    mockCookieGet.mockImplementation(() => {
      throw new Error("cookie failure");
    });

    const { getUserPreferredTheme } = await import("../session-utils");
    const theme = await getUserPreferredTheme();
    expect(theme).toBe("system");
  });
});

// ─────────────────────────────────────────────────────────────────────
// 3. ThemeProvider component
// ─────────────────────────────────────────────────────────────────────
describe("ThemeProvider", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("renders children", async () => {
    const { ThemeProvider } = await import(
      "@/app/components/theme/theme-provider"
    );

    render(
      React.createElement(
        ThemeProvider,
        { initialTheme: "light" },
        React.createElement("span", { "data-testid": "child" }, "Hello"),
      ),
    );

    expect(screen.getByTestId("child")).toHaveTextContent("Hello");
  });

  it("applies 'dark' class to documentElement when initialTheme is 'dark'", async () => {
    const { ThemeProvider } = await import(
      "@/app/components/theme/theme-provider"
    );

    await act(async () => {
      render(
        React.createElement(
          ThemeProvider,
          { initialTheme: "dark" },
          React.createElement("span", null, "content"),
        ),
      );
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes 'dark' class when initialTheme is 'light'", async () => {
    document.documentElement.classList.add("dark");

    const { ThemeProvider } = await import(
      "@/app/components/theme/theme-provider"
    );

    await act(async () => {
      render(
        React.createElement(
          ThemeProvider,
          { initialTheme: "light" },
          React.createElement("span", null, "content"),
        ),
      );
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 4. useTheme hook
// ─────────────────────────────────────────────────────────────────────
describe("useTheme", () => {
  it("throws when used outside ThemeProvider", async () => {
    const { useTheme } = await import("@/app/ui/hooks/useTheme");

    function TestComponent() {
      useTheme();
      return null;
    }

    // Suppress React error boundary console output
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(React.createElement(TestComponent));
    }).toThrow("useTheme must be used within a ThemeProvider");

    spy.mockRestore();
  });
});
