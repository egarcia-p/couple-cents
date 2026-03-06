import { expect } from "@playwright/test";
import { test } from "../fixtures/auth";
import { decrypt } from "../../src/app/lib/crypto";

test.describe("Authentication", () => {
  test.skip("User can sign up and name is encrypted in DB", async ({
    page,
    db,
  }) => {
    const email = `test-${Date.now()}@example.com`;
    const name = "New E2E User";

    // Sign-up is toggled inline on the homepage, no dedicated route
    await page.goto("/en-US/");

    // Wait for page to load and check if sign-up form is visible
    const signupForm = page.locator("#name");
    const isFormVisible = await signupForm.isVisible().catch(() => false);

    if (!isFormVisible) {
      // Click "Create an account" link to toggle sign-up form
      // This button appears near the login form
      const toggleBtn = page
        .locator('button:has-text("Create an account")')
        .first();
      await toggleBtn.waitFor({ state: "visible", timeout: 5000 });
      await toggleBtn.click();
      // Wait for form to appear
      await signupForm.waitFor({ state: "visible", timeout: 5000 });
    }

    // Fill in the sign-up form
    await page.fill("#name", name);
    await page.fill("#email", email);
    await page.fill("#password", "Password123!");
    await page.fill("#confirm-password", "Password123!");

    // Submit the form by finding the form element and submitting it
    const formElement = page.locator("form:has(#name)");
    if ((await formElement.count()) > 0) {
      // If there's a form element, submit it directly
      await formElement.evaluate((form) => (form as HTMLFormElement).submit());
    } else {
      // Otherwise click the button
      const submitBtn = page
        .locator("div:has(#name) button:has-text('Create an account')")
        .last();
      await submitBtn.click();
    }

    // Wait for form submission to process
    await page.waitForTimeout(2000);

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
