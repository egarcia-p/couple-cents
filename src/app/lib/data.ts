import { use } from "react";
import { transactions } from "../../../drizzle/schema";
import { db } from "./db";
import { TransactionForm } from "./definitions";
import { formatCurrency } from "./utils";
import { and, or, ilike, sql, eq, count } from "drizzle-orm";
import _categories from "@/app/lib/data/categories.json";

//Create an interface for categories.json and assign to new var categories
interface ICategories {
  [key: string]: string;
}

const categories: ICategories = _categories;

export async function fetchTransactions() {
  try {
    const data = await db
      .select({
        id: transactions.id,
        description: transactions.note,
        userId: transactions.userId,
        transactionDate: transactions.transactionDate,
        category: sql<string>`category`.mapWith({
          mapFromDriverValue: (value: string) => {
            const mappedValue = categories[value];
            return mappedValue;
          },
        }),
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
        category: sql<string>`category`.mapWith({
          mapFromDriverValue: (value: any) => {
            const mappedValue = Object.entries(categories)[value];
            return mappedValue;
          },
        }),
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

const ITEMS_PER_PAGE = 10;

export async function fetchFilteredTransactions(
  query: string,
  currentPage: number,
  userId: string,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const data = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        transactionDate: transactions.transactionDate,
        category: sql<string>`category`.mapWith({
          mapFromDriverValue: (value: string) => {
            const mappedValue = categories[value];
            return mappedValue;
          },
        }),
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
      .where(
        and(
          or(
            // ilike(transactions.transactionDate, `%${query}%`),
            ilike(transactions.category, `%${query}%`),
            ilike(transactions.establishment, `%${query}%`),
            ilike(transactions.note, `%${query}%`),
            // ilike(transactions.amount, `%${query}%`),
          ),
          eq(transactions.userId, parseInt(userId)),
        ),
      )
      .limit(ITEMS_PER_PAGE)
      .offset(offset);
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch transactions.");
  }
}

export async function fetchTransactionPages(query: string, userId: string) {
  try {
    const data = await db
      .select({ count: sql`count(*)` })
      .from(transactions)
      .where(
        and(
          or(
            // ilike(transactions.transactionDate, `%${query}%`),
            ilike(transactions.category, `%${query}%`),
            ilike(transactions.establishment, `%${query}%`),
            ilike(transactions.note, `%${query}%`),
            // ilike(transactions.amount, `%${query}%`),
          ),
          eq(transactions.userId, parseInt(userId)),
        ),
      );

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of transactions.");
  }
}
