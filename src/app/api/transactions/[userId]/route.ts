import { use } from "react";
import { transactions } from "../../../../../drizzle/schema";
import { db } from "../../../lib/db";
import { formatCurrency } from "../../../lib/utils";
import { and, or, ilike, sql, eq, count, sum, desc } from "drizzle-orm";
import _categories from "@/app/lib/data/categories.json";
import _categoriesIncome from "@/app/lib/data/categoriesForIncome.json";
import { auth } from "@/auth";
import { error } from "console";
import { NextApiRequest, NextApiResponse } from "next";

interface ICategories {
  [key: string]: string;
}

type ResponseData = {
  message: string;
  data: Record<string, any>[];
};

const categoriesMap: ICategories = { ..._categories, ..._categoriesIncome };

export async function GET(
  req: NextApiRequest,
  { params }: { params: { userId: string } },
) {
  const session = await auth();

  if (!session || !session.user || session.user.id != params.userId) {
    return Response.json(
      {
        message: "Unauthenticated user or wrong user",
        data: [],
      },
      { status: 401 },
    );
  } else {
    const data = await fetchAllTransactions(params.userId);

    return Response.json({ message: "Success", data }, { status: 200 });
  }
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
