import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";

// Load test env
dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

async function globalTeardown() {
  console.log("\n🧹 Starting Global E2E Teardown...");

  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) return;

  const pool = new Pool({ connectionString });

  try {
    // Optional: Truncate tables again or leave for manual inspection
    // For now, just ensuring connections are closed
    console.log("🛑 Cleaning up test database connections...");
    await pool.query("SELECT 1"); // verify connection
  } catch (error) {
    console.error("❌ Global Teardown Error:", error);
  } finally {
    await pool.end();
    console.log("✅ Global Teardown Complete.");
  }
}

export default globalTeardown;
