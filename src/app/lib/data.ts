import { transactions } from "../../../drizzle/schema";
import { db } from "./db";

export async function fetchTransactions() {
  try {
    const result = await db.select().from(transactions);

    return result;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch transactions data.");
  }
}
