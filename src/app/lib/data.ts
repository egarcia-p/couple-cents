import { use } from "react";
import { transactions } from "../../../drizzle/schema";
import { db } from "./db";
import { TransactionForm } from "./definitions";
import { formatCurrency } from "./utils";
import { sql, eq } from "drizzle-orm";

export async function fetchTransactions() {
  try {
    const data = await db
      .select({
        id: transactions.id,
        description: transactions.note,
        userId: transactions.userId,
        transactionDate: transactions.transactionDate,
        category: transactions.category,
        establishment: transactions.establishment,
        isExpense: transactions.isExpense,
        isEssential: transactions.isEssential,
        note: transactions.note,
        amount: sql<number>`amount`.mapWith({
          mapFromDriverValue: (value: any) => {
            const mappedValue = value / 100;
            return mappedValue;
          },
        }),
      })
      .from(transactions);

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch transactions data.");
  }
}

export async function fetchTransactionsByUserId(userId: string) {
  try {
    const data = await db
      .select({
        id: transactions.id,
        description: transactions.note,
        userId: transactions.userId,
        transactionDate: transactions.transactionDate,
        category: transactions.category,
        establishment: transactions.establishment,
        isExpense: transactions.isExpense,
        isEssential: transactions.isEssential,
        note: transactions.note,
        amount: sql<number>`amount`.mapWith({
          mapFromDriverValue: (value: any) => {
            const mappedValue = value / 100;
            return mappedValue;
          },
        }),
      })
      .from(transactions)
      .where(eq(transactions.userId, parseInt(userId)));

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch transactions data.");
  }
}

export async function fetchTransactionById(id: string) {
  try {
    const data = await db
      .select({
        id: transactions.id,
        description: transactions.note,
        userId: transactions.userId,
        transactionDate: transactions.transactionDate,
        category: transactions.category,
        establishment: transactions.establishment,
        isExpense: transactions.isExpense,
        isEssential: transactions.isEssential,
        note: transactions.note,
        amount: sql<number>`amount`.mapWith({
          mapFromDriverValue: (value: any) => {
            const mappedValue = value / 100;
            return mappedValue;
          },
        }),
      })
      .from(transactions)
      .where(eq(transactions.id, id));

    return data[0] as TransactionForm;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch transaction.");
  }
}
