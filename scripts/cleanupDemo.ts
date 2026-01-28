import {
  user,
  transactions,
  userBudgetSettings,
  userSettings,
} from "../drizzle/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

const main = async () => {
  const client = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });
  const db = drizzle(client);

  const demoUser = await db
    .select()
    .from(user)
    .where(eq(user.email, "demo@couple-cents.com"));

  if (demoUser.length === 0) {
    console.log("No demo user found");
    return;
  }

  const userId = demoUser[0].id;
  console.log("🧹 Cleaning up demo user data...");

  await db.delete(transactions).where(eq(transactions.userId, userId));
  console.log("✅ Deleted transactions");

  await db
    .delete(userBudgetSettings)
    .where(eq(userBudgetSettings.userId, userId));
  console.log("✅ Deleted budgets");

  await db.delete(userSettings).where(eq(userSettings.userId, userId));
  console.log("✅ Deleted user settings");

  console.log("\n🎉 Cleanup complete!");
  await client.end();
};

main();
