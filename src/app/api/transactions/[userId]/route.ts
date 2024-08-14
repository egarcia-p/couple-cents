import { use } from "react";
import { transactions } from "../../../../../drizzle/schema";
import { db } from "../../../lib/db";
import { formatCurrency } from "../../../lib/utils";
import { and, or, ilike, sql, eq, count, sum, desc } from "drizzle-orm";
import _categories from "@/app/lib/data/categories.json";
import _categoriesIncome from "@/app/lib/data/categoriesForIncome.json";

interface ICategories {
  [key: string]: string;
}

const categoriesMap: ICategories = { ..._categories, ..._categoriesIncome };

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  console.log(params.userId);
  const data = await fetchAllTransactions(params.userId);
  console.log(data);

  return Response.json({ data });
}

export async function fetchAllTransactions(userId: string) {
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
      .where(eq(transactions.userId, parseInt(userId)))
      .orderBy(desc(transactions.transactionDate));

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch transactions.");
  }
}
