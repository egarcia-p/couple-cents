import { use } from "react";
import { transactions } from "../../../drizzle/schema";
import { db } from "./db";
import { TransactionForm } from "./definitions";
import { formatCurrency } from "./utils";
import { and, or, ilike, sql, eq, count, sum, desc } from "drizzle-orm";
import _categories from "@/app/lib/data/categories.json";
import _categoriesIncome from "@/app/lib/data/categoriesForIncome.json";

//Create an interface for categories.json and assign to new var categories
interface ICategories {
  [key: string]: string;
}

const categoriesMap: ICategories = { ..._categories, ..._categoriesIncome };

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
            const mappedValue = categoriesMap[value];
            return mappedValue;
          },
        }),
        establishment: transactions.establishment,
        isExpense: transactions.isExpense,
        isEssential: transactions.isEssential,
        note: transactions.note,
        amount: sql<string>`amount`.mapWith({
          mapFromDriverValue: (value: any) => {
            //let mappedValue = value / 100;
            const mappedValue = formatCurrency(Number(value) ?? "0");
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
      .orderBy(desc(transactions.transactionDate))
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

export async function fetchCardData(userId: string) {
  try {
    const totalMonthSpendData = db
      .select({ value: sum(transactions.amount) })
      .from(transactions)
      .where(
        sql`DATE_TRUNC('month',${transactions.transactionDate}) = DATE_TRUNC('month',CURRENT_TIMESTAMP)
    AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = true
    `,
      );

    const totalMonthIncomeData = db
      .select({ value: sum(transactions.amount) })
      .from(transactions)
      .where(
        sql`DATE_TRUNC('month',${transactions.transactionDate}) = DATE_TRUNC('month',CURRENT_TIMESTAMP)
    AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = false
    `,
      );

    const totalYearSpendData = db
      .select({ value: sum(transactions.amount) })
      .from(transactions)
      .where(
        sql`DATE_TRUNC('year',${transactions.transactionDate}) = DATE_TRUNC('year',CURRENT_TIMESTAMP)
    AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = true
    `,
      );

    const data = await Promise.all([
      totalMonthSpendData,
      totalYearSpendData,
      totalMonthIncomeData,
    ]);

    const totalMonthSpend = formatCurrency(Number(data[0][0].value) ?? "0");
    const totalYearSpend = formatCurrency(Number(data[1][0].value) ?? "0");
    const totalMonthSpendIncome = formatCurrency(
      Number(data[2][0].value) - Number(data[0][0].value) ?? "0",
    );

    return {
      totalMonthSpend,
      totalYearSpend,
      totalMonthSpendIncome,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

export async function fetchSpendDataByMonth(userId: string) {
  try {
    const spendDataByMonth = await db
      .select({
        month: sql`date_part('month',transactions."transactionDate")`,
        total: sql`sum(transactions.amount) as total`.mapWith({
          mapFromDriverValue: (value: any) => {
            const mappedValue = value / 100;
            return mappedValue;
          },
        }),
      })
      .from(transactions)
      .where(
        sql`DATE_TRUNC('year',${transactions.transactionDate}) = DATE_TRUNC('year',CURRENT_TIMESTAMP)
    AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = true`,
      )
      .groupBy(sql`1`);

    return spendDataByMonth;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

export async function fetchSpendDataByCategory(userId: string) {
  try {
    const spendDataByCategory = await db
      .select({
        category: sql`transactions.category`,
        total: sql`sum(transactions.amount) as total`.mapWith({
          mapFromDriverValue: (value: any) => {
            const mappedValue = value / 100;
            return mappedValue;
          },
        }),
      })
      .from(transactions)
      .where(
        sql`DATE_TRUNC('year',${transactions.transactionDate}) = DATE_TRUNC('year',CURRENT_TIMESTAMP)
    AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = true`,
      )
      .groupBy(sql`1`);

    return spendDataByCategory;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}
