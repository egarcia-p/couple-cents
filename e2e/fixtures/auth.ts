import { expect, Page, test as base } from "@playwright/test";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";
import { decrypt } from "../../src/app/lib/crypto";

// Load test env
dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

type AuthFixtures = {
  authenticatedPage: Page;
  migrationPage: Page;
  db: Pool;
};

export const test = base.extend<AuthFixtures>({
  // Direct DB connection
  db: async ({}, use) => {
    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
    await use(pool);
    await pool.end();
  },

  // Automatic login as demo user
  authenticatedPage: async ({ page }, use) => {
    const response = await page.request.post("/api/auth/sign-in/email", {
      data: {
        email: "demo@couple-cents.com",
        password: "DemoPassword123!",
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to login programmatically: ${response.status()} ${await response.text()}`,
      );
    }

    await page.goto("/en-US/dashboard");
    await use(page);
  },

  // Login as migration user (mixed data)
  migrationPage: async ({ page }, use) => {
    const response = await page.request.post("/api/auth/sign-in/email", {
      data: {
        email: "migration@couple-cents.com",
        password: "DemoPassword123!",
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to login migration user: ${response.status()} ${await response.text()}`,
      );
    }

    await page.goto("/en-US/dashboard");
    await use(page);
  },
});
