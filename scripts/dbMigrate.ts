/* eslint-disable no-console */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

async function main() {
  console.log("Migration started");

  const env = process.env.NODE_ENV;
  if (env == "development") {
    const connectionString = process.env.POSTGRES_URL;

    if (!connectionString) {
      throw new Error("POSTGRES_URL not found on .env");
    }

    const migrationsClient = postgres(connectionString, {
      max: 1,
    });
    const db = drizzle(migrationsClient);

    const dbd = drizzle(migrationsClient);

    await migrate(dbd, { migrationsFolder: "./drizzle" });

    console.log("Migration completed");
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed");
  console.log(error);
  process.exit(1);
});
