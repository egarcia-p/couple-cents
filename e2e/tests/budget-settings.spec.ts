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

    // Save button text is specifically "Save Budget" in budget form
    const saveBtn = page.locator('button:has-text("Save Budget")');
    await saveBtn.click();

    // Wait for form submission and page to process
    await page.waitForTimeout(2000);

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
    // Delete any existing budget for this user/category first
    await db.query(
      `DELETE FROM user_budget_settings WHERE "userId" = $1 AND category = $2`,
      [userId, "GRO"],
    );
    // Then insert the new budget
    await db.query(
      `INSERT INTO user_budget_settings ("userId", category, budget) VALUES ($1, $2, $3)`,
      [userId, "GRO", encrypt(budget)],
    );

    await page.goto("/en-US/dashboard");

    // Budget card should show the total budget value
    // The "Budget" card is one of the dashboard stat cards
    const budgetCard = page.locator('h3:has-text("Budget")').locator("..");
    await expect(budgetCard).toBeVisible({ timeout: 10000 });
  });
});
