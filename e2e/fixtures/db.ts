import { test as base } from "@playwright/test";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";

// Load test env
dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

type DbFixtures = {
  db: Pool;
};

export const test = base.extend<DbFixtures>({
  db: async ({}, use) => {
    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
    await use(pool);
    await pool.end();
  },
});
