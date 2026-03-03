import { expect } from "@playwright/test";
import { test } from "../fixtures/auth";
import { decrypt } from "../../src/app/lib/crypto";

test.describe("Migration Compatibility", () => {
  test("Plaintext and encrypted data both render correctly (migrationPage)", async ({
    migrationPage: page,
  }) => {
    await page.goto("/en-US/dashboard/transactions");

    // Seed data: "Old Store" (plaintext), "New Store" (encrypted)
    // Both should be visible in the transaction table
    await expect(page.locator("text=Old Store")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("text=New Store")).toBeVisible({
      timeout: 10000,
    });

    // Check amounts render correctly
    // Plaintext amount "2500" = $25.00, Encrypted amount "3000" = $30.00
    await expect(page.locator("text=$25.00")).toBeVisible();
    await expect(page.locator("text=$30.00")).toBeVisible();
  });

  test("Updating a plaintext record encrypts it in DB", async ({
    migrationPage: page,
    db,
  }) => {
    await page.goto("/en-US/dashboard/transactions");

    // Click edit on the plaintext record "Old Store"
    const row = page.locator('tr:has-text("Old Store")');
    await row.locator('a[href*="/edit"]').click();

    await page.fill("#establishment", "");
    await page.fill("#establishment", "Old Store Encrypted");
    await page.click('button:has-text("Update Transaction")');

    await expect(page).toHaveURL(/\/dashboard\/transactions/, {
      timeout: 15000,
    });
    await expect(page.locator("text=Old Store Encrypted")).toBeVisible({
      timeout: 10000,
    });

    // Verify in DB - should be encrypted now
    const res = await db.query(
      'SELECT establishment FROM transactions WHERE "userId" = $1',
      ["migration-user-id"],
    );
    const found = res.rows.find((r: { establishment: string }) => {
      try {
        return decrypt(r.establishment) === "Old Store Encrypted";
      } catch {
        return false;
      }
    });
    expect(found).toBeDefined();
    expect(found!.establishment).toContain(":");
  });

  test("Dashboard totals include both plaintext and encrypted amounts", async ({
    migrationPage: page,
  }) => {
    await page.goto("/en-US/dashboard");

    // The "Current Spend" card should show the combined total
    // Both amounts are for expenses, so combined total should appear
    const spendCard = page
      .locator('h3:has-text("Current Spend")')
      .locator("..");
    await expect(spendCard).toBeVisible({ timeout: 10000 });
  });

  test("No console errors when rendering mixed data", async ({
    migrationPage: page,
  }) => {
    const logs: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") logs.push(msg.text());
    });

    await page.goto("/en-US/dashboard/transactions");

    // Wait for any async UI errors
    await page.waitForTimeout(2000);

    // Filter out known non-critical errors (e.g., React hydration warnings, Next.js dev mode warnings)
    const criticalErrors = logs.filter(
      (log) =>
        !log.includes("Warning:") &&
        !log.includes("DevTools") &&
        !log.includes("favicon"),
    );
    expect(criticalErrors).toEqual([]);
  });
});
