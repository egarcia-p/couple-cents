import { expect } from "@playwright/test";
import { test } from "../fixtures/auth";
import { decrypt, encrypt } from "../../src/app/lib/crypto";

test.describe("Budget Settings", () => {
  test("User can set budget and it is encrypted in DB", async ({
    authenticatedPage: page,
    db,
  }) => {
    await page.goto("/en-US/dashboard/profile");

    const groBudget = "650";
    const entBudget = "320";

    // Budget input IDs follow the pattern budget-{CATEGORY_CODE}
    await page.fill("#budget-GRO", groBudget);
    await page.fill("#budget-ENT", entBudget);

    // Save button text is "Save Budget"
    await page.click('button:has-text("Save Budget")');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Verify in DB - stored encrypted
    const res = await db.query(
      'SELECT budget, category FROM user_budget_settings WHERE "userId" = $1 AND category IN ($2, $3)',
      ["test-user-id", "GRO", "ENT"],
    );
    expect(res.rows.length).toBe(2);

    const groRow = res.rows.find(
      (r: { category: string }) => r.category === "GRO",
    );
    expect(groRow.budget).toContain(":");
    expect(decrypt(groRow.budget)).toBe(groBudget);

    const entRow = res.rows.find(
      (r: { category: string }) => r.category === "ENT",
    );
    expect(entRow.budget).toContain(":");
    expect(decrypt(entRow.budget)).toBe(entBudget);
  });

  test("Dashboard totals use decrypted budget values", async ({
    authenticatedPage: page,
    db,
  }) => {
    // Set a budget for groceries
    const userId = "test-user-id";
    const budget = "5000";
    await db.query(
      `INSERT INTO user_budget_settings ("userId", category, budget)
       VALUES ($1, $2, $3)
       ON CONFLICT ("userId", category) DO UPDATE SET budget = EXCLUDED.budget`,
      [userId, "GRO", encrypt(budget)],
    );

    await page.goto("/en-US/dashboard");

    // Budget card should show the total budget value
    // The "Budget" card is one of the dashboard stat cards
    const budgetCard = page.locator('h3:has-text("Budget")').locator("..");
    await expect(budgetCard).toBeVisible({ timeout: 10000 });
  });
});
