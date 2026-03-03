import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";
import { hashPassword } from "better-auth/crypto";
import { encrypt } from "../src/app/lib/crypto";

// Load test env
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

async function globalSetup() {
  console.log("\n🏗️  Starting Global E2E Setup...");

  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) throw new Error("POSTGRES_URL not found in .env.test");

  // 1. Run migrations
  console.log("📂 Running Drizzle migrations on test database...");
  const sql = postgres(connectionString, { max: 1 });
  const dbMigrate = drizzle(sql);
  await migrate(dbMigrate, { migrationsFolder: "./drizzle" });
  await sql.end();

  // 2. Seed initial test data
  console.log("🌱 Seeding test data...");
  const pool = new Pool({ connectionString });

  try {
    // Clean start
    await pool.query(
      'TRUNCATE TABLE "session", "account", "verification", "transactions", "user_budget_settings", "user_settings", "user" CASCADE',
    );

    const DEMO_USER_ID = "test-user-id";
    const MIGRATION_USER_ID = "migration-user-id";
    const hashedPassword = await hashPassword("DemoPassword123!");

    // Create main demo user (encrypted name)
    await pool.query(
      `INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [DEMO_USER_ID, encrypt("Demo User"), "demo@couple-cents.com", true],
    );

    await pool.query(
      `INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        crypto.randomUUID(),
        DEMO_USER_ID,
        "credential",
        DEMO_USER_ID,
        hashedPassword,
      ],
    );

    // Create user for migration testing (mixed data)
    await pool.query(
      `INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [MIGRATION_USER_ID, "Plaintext User", "migration@couple-cents.com", true],
    );

    await pool.query(
      `INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        crypto.randomUUID(),
        MIGRATION_USER_ID,
        "credential",
        MIGRATION_USER_ID,
        hashedPassword,
      ],
    );

    // Seed settings for demo user
    await pool.query(
      `INSERT INTO "user_settings" ("userId", language, timezone) VALUES ($1, $2, $3)`,
      [DEMO_USER_ID, "en-US", "America/Chicago"],
    );

    // Seed some encrypted transactions for demo user
    const txId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO "transactions" (id, "isExpense", amount, establishment, category, "isEssential", "userId", "transactionDate") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        txId,
        true,
        encrypt("5000"), // $50.00
        encrypt("Target"),
        "GRO",
        true,
        DEMO_USER_ID,
        new Date(),
      ],
    );

    // Seed mixed transactions for migration user
    // 1. Plaintext
    await pool.query(
      `INSERT INTO "transactions" (id, "isExpense", amount, establishment, category, "isEssential", "userId", "transactionDate") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        crypto.randomUUID(),
        true,
        "2500",
        "Old Store",
        "SHO",
        false,
        MIGRATION_USER_ID,
        new Date(),
      ],
    );
    // 2. Encrypted
    await pool.query(
      `INSERT INTO "transactions" (id, "isExpense", amount, establishment, category, "isEssential", "userId", "transactionDate") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        crypto.randomUUID(),
        true,
        encrypt("3000"),
        encrypt("New Store"),
        "ENT",
        false,
        MIGRATION_USER_ID,
        new Date(),
      ],
    );

    console.log("✅ Global Setup Complete.");
  } catch (error) {
    console.error("❌ Global Setup Failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

export default globalSetup;
