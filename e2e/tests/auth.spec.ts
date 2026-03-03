import { expect } from "@playwright/test";
import { test } from "../fixtures/auth";
import { decrypt } from "../../src/app/lib/crypto";

test.describe("Authentication", () => {
  test("User can sign up and name is encrypted in DB", async ({ page, db }) => {
    const email = `test-${Date.now()}@example.com`;
    const name = "New E2E User";

    // Sign-up is toggled inline on the homepage, no dedicated route
    await page.goto("/en-US/");

    // Click "Create an account" link to toggle sign-up form
    await page.click('button:has-text("Create an account")');

    // Fill in the sign-up form
    await page.fill("#name", name);
    await page.fill("#email", email);
    await page.fill("#password", "Password123!");
    await page.fill("#confirm-password", "Password123!");

    // Submit (button text is "Create an account")
    await page.click('button:has-text("Create an account")');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Verify in DB that name is encrypted
    const res = await db.query('SELECT name FROM "user" WHERE email = $1', [
      email,
    ]);
    expect(res.rows.length).toBe(1);
    const encryptedName = res.rows[0].name;
    expect(encryptedName).toContain(":"); // Format iv:ciphertext:authTag
    expect(decrypt(encryptedName)).toBe(name);
  });

  test("User can login via two-step form", async ({ page }) => {
    await page.goto("/en-US/");

    // Step 1: Email — button text is "Submit"
    await page.fill('input[type="email"]', "demo@couple-cents.com");
    await page.click('button:has-text("Submit")');

    // Step 2: Password — button text is "Login"
    await page.fill('input[type="password"]', "DemoPassword123!");
    await page.click('button:has-text("Login")');

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("Invalid password shows error", async ({ page }) => {
    await page.goto("/en-US/");

    // Step 1
    await page.fill('input[type="email"]', "demo@couple-cents.com");
    await page.click('button:has-text("Submit")');

    // Step 2 with wrong password
    await page.fill('input[type="password"]', "WrongPassword!");
    await page.click('button:has-text("Login")');

    // Error message from translations: "Invalid email or password. Please try again."
    await expect(page.locator("text=Invalid email or password")).toBeVisible({
      timeout: 10000,
    });
  });

  test("Unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/en-US/dashboard");
    // App redirects to /en-US (the homepage with login)
    await expect(page).toHaveURL(/\/en-US\/?$/, { timeout: 10000 });
  });

  test("User can logout", async ({ authenticatedPage: page }) => {
    // Ensure we're on the dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Logout button text is "Sign Out" (visible on md+ screens)
    await page.click('button:has-text("Sign Out")');
    await expect(page).toHaveURL(/\/en-US\/?$/, { timeout: 10000 });
  });
});
