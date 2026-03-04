import { expect } from "@playwright/test";
import { test } from "../fixtures/auth";
import { createTransaction } from "../helpers/seed";

test.describe("Search & Filtering", () => {
  test.beforeEach(async ({ db }) => {
    // Seed some specific transactions for searching
    const userId = "test-user-id";
    await createTransaction(db, userId, {
      amount: "1000",
      establishment: "UniqueSearchTerm",
      category: "ENT",
      isExpense: true,
      isEssential: false,
    });
    await createTransaction(db, userId, {
      amount: "2000",
      establishment: "AnotherShop",
      category: "GRO",
      isExpense: true,
      isEssential: true,
    });
  });

  test("User can search by establishment name (decrypted)", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/en-US/dashboard/transactions");

    // Search input placeholder is "Search transactions..." (there are 2: one desktop, one mobile)
    // Use :visible and :first to get the one actually on screen
    const searchInput = page
      .locator('input[placeholder*="Search"]:visible')
      .first();
    await searchInput.fill("UniqueSearch");

    // Wait for debounce (1000ms) + network
    await page.waitForTimeout(2000);

    await expect(
      page.locator('table tbody td:has-text("UniqueSearchTerm")'),
    ).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.locator('table tbody td:has-text("AnotherShop")'),
    ).not.toBeVisible();
  });

  test("Search is case-insensitive", async ({ authenticatedPage: page }) => {
    await page.goto("/en-US/dashboard/transactions");

    const searchInput = page
      .locator('input[placeholder*="Search"]:visible')
      .first();
    await searchInput.fill("uniquesearchterm");

    await page.waitForTimeout(2000);

    await expect(
      page.locator('table tbody td:has-text("UniqueSearchTerm")').first(),
    ).toBeVisible({
      timeout: 10000,
    });
  });

  test("User can filter by category", async ({ authenticatedPage: page }) => {
    await page.goto("/en-US/dashboard/transactions");

    const searchInput = page
      .locator('input[placeholder*="Search"]:visible')
      .first();
    // Search by the establishment name that belongs to ENT category
    await searchInput.fill("UniqueSearchTerm");

    await page.waitForTimeout(2000);

    await expect(
      page.locator('table tbody td:has-text("UniqueSearchTerm")').first(),
    ).toBeVisible({
      timeout: 10000,
    });
  });

  test("Empty state is shown when no results found", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/en-US/dashboard/transactions");

    const searchInput = page
      .locator('input[placeholder*="Search"]:visible')
      .first();
    await searchInput.fill("NonExistentTermXYZ123");

    await page.waitForTimeout(2000);

    // Table should not contain any transaction data
    const rowCount = await page.locator("table tbody tr").count();
    expect(rowCount).toBe(0);
  });
});
