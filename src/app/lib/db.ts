import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const client = new Pool({
  connectionString: process.env.POSTGRES_URL,
});
export const db = drizzle(client);
