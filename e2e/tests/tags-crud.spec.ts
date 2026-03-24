import { expect } from "@playwright/test";
import { test } from "../fixtures/auth";
import {
  createTag,
  createTransaction,
  addTagToTransaction,
} from "../helpers/seed";

const USER_ID = "test-user-id";

test.describe("Tags CRUD", () => {
  // Clean up tags (and cascade-delete transaction_tags) before each test
  // to avoid leftover data from previous runs.
  test.beforeEach(async ({ db }) => {
    await db.query('DELETE FROM tags WHERE "userId" = $1', [USER_ID]);
    await db.query('DELETE FROM transactions WHERE "userId" = $1', [USER_ID]);
  });

  test.describe("Tag Management on Profile Page", () => {
    test("User can create a tag from the profile page", async ({
      authenticatedPage: page,
      db,
    }) => {
      await page.goto("/en-US/dashboard/profile");

      const tagName = "Groceries E2E";
      const tagColor = "#22C55E";

      await page.fill("#tag-name", tagName);
      // Set color via the color input
      await page.fill("#tag-color", tagColor);

      await page.click('button:has-text("Add Tag")');

      // Wait for page to reload after redirect
      await expect(page).toHaveURL(/\/dashboard\/profile/, {
        timeout: 15000,
      });

      // Verify the tag appears on the profile page
      await expect(page.locator(`text=${tagName}`).first()).toBeVisible({
        timeout: 10000,
      });

      // Verify tag was persisted in the database
      const result = await db.query(
        'SELECT name, color FROM tags WHERE "userId" = $1 AND name = $2',
        [USER_ID, tagName],
      );
      expect(result.rows.length).toBe(1);
      expect(result.rows[0].color.toUpperCase()).toBe(tagColor);
    });

    test("User can see existing tags on the profile page", async ({
      authenticatedPage: page,
      db,
    }) => {
      // Seed tags directly in DB
      await createTag(db, USER_ID, { name: "Cash", color: "#EF4444" });
      await createTag(db, USER_ID, {
        name: "Credit Card",
        color: "#3B82F6",
      });

      await page.goto("/en-US/dashboard/profile");

      await expect(page.locator("text=Cash").first()).toBeVisible({
        timeout: 10000,
      });
      await expect(page.locator("text=Credit Card").first()).toBeVisible({
        timeout: 10000,
      });
    });

    test("User can update a tag name and color", async ({
      authenticatedPage: page,
      db,
    }) => {
      // Seed a tag to edit
      const tagId = await createTag(db, USER_ID, {
        name: "Old Name",
        color: "#EF4444",
      });

      await page.goto("/en-US/dashboard/profile");

      // Verify the tag is visible
      await expect(page.locator("text=Old Name").first()).toBeVisible({
        timeout: 10000,
      });

      // Click the edit button (pencil icon) on the tag row
      // The tag row contains the tag name and edit/delete buttons
      const tagRow = page
        .locator("div.rounded-md.border.border-gray-200.bg-white", {
          hasText: "Old Name",
        })
        .first();
      // The edit button is a button with a pencil SVG inside, in a bg-gray-100 button
      const editBtn = tagRow.locator("button.bg-gray-100").first();
      await editBtn.click();

      // The edit form should now be visible with name and color inputs
      const editNameInput = page.locator(
        'input[name="name"][type="text"][value="Old Name"]',
      );
      await expect(editNameInput).toBeVisible({ timeout: 10000 });

      // Clear and type new name
      await editNameInput.fill("Updated Name");

      // Submit the edit form
      await page.getByRole("button", { name: "Save", exact: true }).click();

      // Wait for the server action to complete and reload to reset client
      // state (editingTagId), so we verify actual server-rendered data
      // instead of stale client-side input values.
      await page.waitForLoadState("networkidle");
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Verify updated name is shown (read-only, not in edit form)
      await expect(page.locator("text=Updated Name").first()).toBeVisible({
        timeout: 10000,
      });
      // Old name should no longer be visible
      await expect(page.locator("text=Old Name")).not.toBeVisible();

      // Verify update in DB
      const result = await db.query("SELECT name FROM tags WHERE id = $1", [
        tagId,
      ]);
      expect(result.rows[0].name).toBe("Updated Name");
    });

    test("User can delete a tag", async ({ authenticatedPage: page, db }) => {
      // Seed a tag to delete
      const tagId = await createTag(db, USER_ID, {
        name: "ToDelete",
        color: "#6B7280",
      });

      await page.goto("/en-US/dashboard/profile");

      await expect(page.locator("text=ToDelete").first()).toBeVisible({
        timeout: 10000,
      });

      // Handle the confirmation dialog
      page.on("dialog", async (dialog) => {
        expect(dialog.type()).toBe("confirm");
        await dialog.accept();
      });

      // Click the delete button (red bg-red-600 button with trash icon)
      const tagRow = page.locator("text=ToDelete").first().locator("..");
      const deleteBtn = tagRow.locator("button.bg-red-600").first();
      await deleteBtn.click();

      // Wait for the page to update
      await page.waitForTimeout(2000);

      // Reload to ensure server state is reflected
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Verify the tag is no longer visible
      await expect(page.locator("text=ToDelete")).not.toBeVisible();

      // Verify deletion in DB
      const result = await db.query("SELECT id FROM tags WHERE id = $1", [
        tagId,
      ]);
      expect(result.rows.length).toBe(0);
    });

    test("Deleting a tag removes it from associated transactions", async ({
      authenticatedPage: page,
      db,
    }) => {
      // Seed a tag and associate it with a transaction
      const tagId = await createTag(db, USER_ID, {
        name: "CascadeTest",
        color: "#8B5CF6",
      });
      const txId = await createTransaction(db, USER_ID, {
        amount: "500",
        establishment: "Cascade Store",
        category: "GRO",
        isExpense: true,
        isEssential: false,
      });
      await addTagToTransaction(db, txId, tagId);

      // Verify junction row exists
      const junctionBefore = await db.query(
        'SELECT * FROM transaction_tags WHERE "tagId" = $1',
        [tagId],
      );
      expect(junctionBefore.rows.length).toBe(1);

      await page.goto("/en-US/dashboard/profile");

      // Handle confirmation dialog
      page.on("dialog", async (dialog) => {
        await dialog.accept();
      });

      // Delete the tag
      const tagRow = page.locator("text=CascadeTest").first().locator("..");
      await tagRow.locator("button.bg-red-600").first().click();

      await page.waitForTimeout(2000);

      // Verify junction table entry was cascade-deleted
      const junctionAfter = await db.query(
        'SELECT * FROM transaction_tags WHERE "tagId" = $1',
        [tagId],
      );
      expect(junctionAfter.rows.length).toBe(0);
    });
  });

  test.describe("Tags on Transactions", () => {
    test("User can assign tags when creating a transaction", async ({
      authenticatedPage: page,
      db,
    }) => {
      // Seed tags first
      const tagId = await createTag(db, USER_ID, {
        name: "Weekly",
        color: "#F97316",
      });

      await page.goto("/en-US/dashboard/transactions/create?isExpense=true");

      await page.fill("#amount", "42.00");
      await page.fill("#establishment", "Tagged Store");
      await page.selectOption("#category", "GRO");

      // Open the tag selector dropdown
      const tagSelector = page.locator("text=Select tags").first();
      await tagSelector.click();

      // Select the "Weekly" tag from the dropdown
      await page.locator('button:has-text("Weekly")').click();

      // Submit
      await page.click('button:has-text("Create Transaction")');

      await expect(page).toHaveURL(/\/dashboard\/transactions/, {
        timeout: 15000,
      });

      // Verify the tag badge appears in the transactions table
      await expect(
        page.locator('table tbody td:has-text("Tagged Store")'),
      ).toBeVisible({ timeout: 10000 });

      // Verify in DB that transaction_tags entry was created
      const txResult = await db.query(
        `SELECT t.id FROM transactions t
         JOIN transaction_tags tt ON tt."transactionId" = t.id
         WHERE tt."tagId" = $1 AND t."userId" = $2`,
        [tagId, USER_ID],
      );
      expect(txResult.rows.length).toBeGreaterThanOrEqual(1);
    });

    test("User can see tags displayed on transactions in the table", async ({
      authenticatedPage: page,
      db,
    }) => {
      // Seed a tag and a transaction with that tag
      const tagId = await createTag(db, USER_ID, {
        name: "Visible Tag",
        color: "#14B8A6",
      });
      const txId = await createTransaction(db, USER_ID, {
        amount: "1500",
        establishment: "Tag Visible Store",
        category: "ENT",
        isExpense: true,
        isEssential: false,
      });
      await addTagToTransaction(db, txId, tagId);

      await page.goto("/en-US/dashboard/transactions");

      // The tag badge should be visible in the table
      await expect(
        page.locator('table tbody td:has-text("Tag Visible Store")'),
      ).toBeVisible({ timeout: 10000 });
      await expect(
        page.locator('table tbody:has-text("Visible Tag")'),
      ).toBeVisible({ timeout: 10000 });
    });

    test("User can update tags on an existing transaction", async ({
      authenticatedPage: page,
      db,
    }) => {
      // Seed two tags and a transaction with one tag
      const tag1Id = await createTag(db, USER_ID, {
        name: "Original Tag",
        color: "#EAB308",
      });
      const tag2Id = await createTag(db, USER_ID, {
        name: "New Tag",
        color: "#EC4899",
      });
      const txId = await createTransaction(db, USER_ID, {
        amount: "2500",
        establishment: "Edit Tags Store",
        category: "GRO",
        isExpense: true,
        isEssential: false,
      });
      await addTagToTransaction(db, txId, tag1Id);

      await page.goto("/en-US/dashboard/transactions");

      // Click edit on the transaction that has "Edit Tags Store"
      // Find the row with the establishment name and click its edit link
      const editLink = page
        .locator("tr", { hasText: "Edit Tags Store" })
        .locator('a[href*="/edit"]');
      await editLink.click();

      await expect(page).toHaveURL(/\/edit/, { timeout: 15000 });

      // The tag selector should show "Original Tag" as selected
      await expect(page.locator("text=Original Tag").first()).toBeVisible({
        timeout: 10000,
      });

      // Open the tag selector to add "New Tag".
      // Use the chevron (last svg in the trigger div) to open and close the
      // dropdown. This avoids accidentally clicking the ✕ remove button on
      // the "Original Tag" badge, which would silently remove it.
      // Going up only ONE level (..) from the badge span gives the trigger div.
      const triggerDiv = page
        .locator("text=Original Tag")
        .first()
        .locator("..");
      await triggerDiv.locator("svg").last().click();

      // Select "New Tag"
      await page.locator('button:has-text("New Tag")').click();

      // Close the dropdown before submitting the form. The dropdown is
      // position:absolute with z-10 and doesn't auto-close after tag selection,
      // so it would cover the submit button and cause the click to time out.
      await triggerDiv.locator("svg").last().click();

      // Submit the update
      await page.click('button:has-text("Update Transaction")');

      await expect(page).toHaveURL(/\/dashboard\/transactions/, {
        timeout: 15000,
      });
      await page.waitForLoadState("networkidle");

      // Verify in DB that both tags are now associated
      const tagResult = await db.query(
        'SELECT "tagId" FROM transaction_tags WHERE "transactionId" = $1 ORDER BY "tagId"',
        [txId],
      );
      expect(tagResult.rows.length).toBe(2);
      const tagIds = tagResult.rows.map((r: { tagId: string }) => r.tagId);
      expect(tagIds).toContain(tag1Id);
      expect(tagIds).toContain(tag2Id);
    });
  });

  test.describe("Tag Filtering on Transactions Page", () => {
    test("User can filter transactions by tag", async ({
      authenticatedPage: page,
      db,
    }) => {
      // Seed two tags
      const tagAId = await createTag(db, USER_ID, {
        name: "FilterTagA",
        color: "#3B82F6",
      });
      const tagBId = await createTag(db, USER_ID, {
        name: "FilterTagB",
        color: "#EF4444",
      });

      // Seed two transactions, each with a different tag
      const txA = await createTransaction(db, USER_ID, {
        amount: "1000",
        establishment: "Store With TagA",
        category: "GRO",
        isExpense: true,
        isEssential: false,
      });
      await addTagToTransaction(db, txA, tagAId);

      const txB = await createTransaction(db, USER_ID, {
        amount: "2000",
        establishment: "Store With TagB",
        category: "ENT",
        isExpense: true,
        isEssential: false,
      });
      await addTagToTransaction(db, txB, tagBId);

      await page.goto("/en-US/dashboard/transactions");

      // Both transactions should be visible initially
      await expect(
        page.locator('table tbody td:has-text("Store With TagA")'),
      ).toBeVisible({ timeout: 10000 });
      await expect(
        page.locator('table tbody td:has-text("Store With TagB")'),
      ).toBeVisible({ timeout: 10000 });

      // Open the tag filter dropdown
      const tagFilter = page.locator("text=Filter by tags...").first();
      await tagFilter.click();

      // Select FilterTagA
      await page.locator('button:has-text("FilterTagA")').click();

      // Wait for the filter to apply (URL update + re-render)
      await page.waitForTimeout(2000);

      // Store With TagA should be visible
      await expect(
        page.locator('table tbody td:has-text("Store With TagA")'),
      ).toBeVisible({ timeout: 10000 });
      // Store With TagB should NOT be visible
      await expect(
        page.locator('table tbody td:has-text("Store With TagB")'),
      ).not.toBeVisible();

      // URL should include tagIds parameter
      expect(page.url()).toContain("tagIds=");
    });

    test("User can clear tag filter", async ({
      authenticatedPage: page,
      db,
    }) => {
      // Seed a tag and a transaction
      const tagId = await createTag(db, USER_ID, {
        name: "ClearFilterTag",
        color: "#0EA5E9",
      });
      const txId = await createTransaction(db, USER_ID, {
        amount: "750",
        establishment: "Clear Filter Store",
        category: "GRO",
        isExpense: true,
        isEssential: false,
      });
      await addTagToTransaction(db, txId, tagId);

      await page.goto("/en-US/dashboard/transactions");

      // Open the filter and select the tag
      const tagFilter = page.locator("text=Filter by tags...").first();
      await tagFilter.click();
      await page.locator('button:has-text("ClearFilterTag")').click();

      await page.waitForTimeout(2000);

      // Verify filter is active
      expect(page.url()).toContain("tagIds=");

      // Click "Clear" to remove the filter
      // The clear button appears inside the dropdown when tags are selected
      // Need to reopen dropdown if it closed
      const filterArea = page
        .locator("text=ClearFilterTag")
        .first()
        .locator("../..");
      await filterArea.click();
      await page.locator('button:has-text("Clear")').click();

      await page.waitForTimeout(2000);

      // URL should no longer have tagIds
      expect(page.url()).not.toContain("tagIds=");
    });
  });
});
