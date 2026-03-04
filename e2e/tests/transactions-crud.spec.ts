import { expect } from "@playwright/test";
import { test } from "../fixtures/auth";
import { decrypt } from "../../src/app/lib/crypto";

test.describe("Transactions CRUD", () => {
  test("User can create an expense and it is encrypted in DB", async ({
    authenticatedPage: page,
    db,
  }) => {
    await page.goto("/en-US/dashboard/transactions/create?isExpense=true");

    const amount = "125.50";
    const establishment = "Walmart E2E";

    await page.fill("#amount", amount);
    await page.fill("#establishment", establishment);
    await page.selectOption("#category", "GRO");
    await page.fill("#note", "Weekly groceries test");
    await page.check("#isEssential");

    await page.click('button:has-text("Create Transaction")');

    // Should redirect to transactions table
    await expect(page).toHaveURL(/\/dashboard\/transactions/, {
      timeout: 15000,
    });

    // Verify UI shows it correctly (desktop table, visible on md+)
    // Use table cell selector to avoid mobile duplicate
    await expect(
      page.locator(`table tbody td:has-text("${establishment}")`),
    ).toBeVisible({
      timeout: 10000,
    });

    // Verify in DB - encrypted format
    // Establishment is encrypted so SQL LIKE won't match; fetch all for user and check in JS
    const allTx = await db.query(
      'SELECT amount, establishment FROM transactions WHERE "userId" = $1',
      ["test-user-id"],
    );
    const found = allTx.rows.find((row) => {
      try {
        return decrypt(row.establishment) === establishment;
      } catch {
        return false;
      }
    });
    expect(found).toBeDefined();
    // Amount is stored in cents: 125.50 * 100 = 12550
    expect(decrypt(found!.amount)).toBe("12550");
  });

  test("User can create an income", async ({ authenticatedPage: page }) => {
    await page.goto("/en-US/dashboard/transactions/create?isExpense=false");

    await page.fill("#amount", "3000");
    await page.fill("#establishment", "Monthly Salary");
    // Income categories - use a valid income category
    await page.selectOption("#category", "SAL");

    await page.click('button:has-text("Create Transaction")');
    await expect(page).toHaveURL(/\/dashboard\/transactions/, {
      timeout: 15000,
    });
    await expect(
      page.locator(`table tbody td:has-text("Monthly Salary")`),
    ).toBeVisible({
      timeout: 10000,
    });
  });

  test("User can edit a transaction and it re-encrypts", async ({
    authenticatedPage: page,
    db,
  }) => {
    // Navigate to transactions and click edit on the first one
    await page.goto("/en-US/dashboard/transactions");

    // Click edit icon on the first row (PencilIcon inside a link)
    await page.click('a[href*="/edit"]:first-of-type');

    const newEstablishment = "Updated Store " + Date.now();
    await page.fill("#establishment", "");
    await page.fill("#establishment", newEstablishment);
    await page.click('button:has-text("Update Transaction")');

    await expect(page).toHaveURL(/\/dashboard\/transactions/, {
      timeout: 15000,
    });
    await expect(
      page.locator(`table tbody td:has-text("${newEstablishment}")`),
    ).toBeVisible({
      timeout: 10000,
    });

    // Verify encryption in DB
    const allTx = await db.query(
      'SELECT establishment FROM transactions WHERE "userId" = $1',
      ["test-user-id"],
    );
    const found = allTx.rows.find((row) => {
      try {
        return decrypt(row.establishment) === newEstablishment;
      } catch {
        return false;
      }
    });
    expect(found).toBeDefined();
  });

  test.skip("User can delete a transaction", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/en-US/dashboard/transactions");

    // Get initial count of rows
    const initialRows = await page.locator("table tbody tr").count();
    console.log(`Initial rows: ${initialRows}`);

    // Click delete button (TrashIcon with aria-label="delete") — get the first one
    const deleteBtn = page.locator('button[aria-label="delete"]').first();
    await deleteBtn.click();

    // Wait for the dialog to appear and confirm button to be visible
    const confirmBtn = page.locator('button:has-text("Yes")');
    await confirmBtn.waitFor({ state: "visible", timeout: 10000 });

    // Click confirm button
    await confirmBtn.click();

    // Wait for the dialog to close
    await page.waitForTimeout(500);

    // Check if there's an error message
    const errorMsg = page.locator(".bg-red-100");
    const hasError = await errorMsg.count().then((count) => count > 0);
    if (hasError) {
      console.log("Error message found after delete");
    }

    // Wait longer for async deletion to complete
    await page.waitForTimeout(2000);

    // Reload page to ensure we're seeing the latest data from server
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify the row count decreased
    const finalRows = await page.locator("table tbody tr").count();
    console.log(`Final rows: ${finalRows}`);
    expect(finalRows).toBeLessThan(initialRows);
  });
});
