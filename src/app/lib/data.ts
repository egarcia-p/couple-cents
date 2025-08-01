import { use } from "react";
import { transactions, userBudgetSettings } from "../../../drizzle/schema";
import { db } from "./db";
import { TransactionForm } from "./definitions";
import { formatCurrency, formatPercentage } from "./utils";
import { and, or, ilike, sql, eq, count, sum, desc } from "drizzle-orm";
import _categories from "@/app/lib/data/categories.json";
import _categoriesIncome from "@/app/lib/data/categoriesForIncome.json";

//Create an interface for categories.json and assign to new var categories
interface ICategories {
  [key: string]: string;
}

const categoriesMap: ICategories = { ..._categories, ..._categoriesIncome };

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
            if (value === null || value === undefined) {
              return "0";
            }
            let mappedValue = value / 100;

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
  dates: string,
  currentPage: number,
  userId: string,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const dateArray = dates.split("to");
  const startDate = dateArray[0];
  const endDate = dateArray[1];

  const matchingCodes = Object.entries(categoriesMap)
    .filter(([code, name]) => name.toLowerCase().includes(query.toLowerCase()))
    .map(([code]) => code);

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
            ...matchingCodes.map((code) => eq(transactions.category, code)),
            ilike(transactions.establishment, `%${query}%`),
            ilike(transactions.note, `%${query}%`),
            // ilike(transactions.amount, `%${query}%`),
          ),
          eq(transactions.userId, parseInt(userId)),
          sql`${transactions.transactionDate} BETWEEN ${startDate} AND ${endDate}`,
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

export async function fetchTransactionPages(
  query: string,
  dates: string,
  userId: string,
) {
  try {
    const dateArray = dates.split("to");
    const startDate = dateArray[0];
    const endDate = dateArray[1];

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
          sql`${transactions.transactionDate} BETWEEN ${startDate} AND ${endDate}`,
        ),
      );

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of transactions.");
  }
}

export async function fetchCardData(
  userId: string,
  month: string,
  year: string,
) {
  try {
    const totalMonthSpendData = db
      .select({ value: sum(transactions.amount) })
      .from(transactions)
      .where(
        sql`EXTRACT(MONTH FROM ${transactions.transactionDate}) = ${month}
    AND EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}
    AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = true
    `,
      );

    const totalMonthIncomeData = db
      .select({ value: sum(transactions.amount) })
      .from(transactions)
      .where(
        sql`EXTRACT(MONTH FROM ${transactions.transactionDate}) = ${month}
    AND EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}
    AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = false
    `,
      );

    const totalYearSpendData = db
      .select({ value: sum(transactions.amount) })
      .from(transactions)
      .where(
        sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}
    AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = true
    `,
      );

    const totalYearIncomeData = db
      .select({ value: sum(transactions.amount) })
      .from(transactions)
      .where(
        sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}
    AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = false
    `,
      );

    const totalMonthBudgetData = db
      .select({ value: sum(userBudgetSettings.budget) })
      .from(userBudgetSettings)
      .where(sql`${userBudgetSettings.userId} = ${userId}`);

    const data = await Promise.all([
      totalMonthSpendData,
      totalYearSpendData,
      totalMonthIncomeData,
      totalYearIncomeData,
      totalMonthBudgetData,
    ]);

    const totalMonthSpendDB = Number(data[0][0].value);
    const totalYearSpendDB = Number(data[1][0].value);
    const totalMonthIncomeDB = Number(data[2][0].value);
    const totalYearIncomeDB = Number(data[3][0].value);
    const totalMonthBudgetDB = Number(data[4][0].value);

    let percentageOfIncomeSpentMonth: number | string;
    let percentageOfIncomeSpentYear: number | string;
    if (totalMonthIncomeDB > 0) {
      percentageOfIncomeSpentMonth = totalMonthSpendDB / totalMonthIncomeDB;
      percentageOfIncomeSpentMonth = formatPercentage(
        Number(percentageOfIncomeSpentMonth),
      );
    } else {
      percentageOfIncomeSpentMonth = "No Income";
    }

    if (totalYearIncomeDB > 0) {
      percentageOfIncomeSpentYear = totalYearSpendDB / totalYearIncomeDB;
      percentageOfIncomeSpentYear = formatPercentage(
        Number(percentageOfIncomeSpentYear),
      );
    } else {
      percentageOfIncomeSpentYear = "No Income";
    }

    const totalMonthSpend = formatCurrency(totalMonthSpendDB ?? "0");
    const totalYearSpend = formatCurrency(totalYearSpendDB ?? "0");
    const totalMonthIncome = formatCurrency(totalMonthIncomeDB ?? "0");
    const totalYearIncome = formatCurrency(totalYearIncomeDB ?? "0");
    const totalMonthSpendIncome = formatCurrency(
      totalMonthIncomeDB - totalMonthSpendDB,
    );
    const totalYearSpendIncome = formatCurrency(
      totalYearIncomeDB - totalYearSpendDB,
    );

    const totalMonthBudget = totalMonthBudgetDB
      ? formatCurrency(totalMonthBudgetDB * 100) //convert from cents to dollars
      : formatCurrency(0);
    //Calculate total year budget
    const totalYearBudget = totalMonthBudgetDB
      ? formatCurrency(totalMonthBudgetDB * 100 * 12)
      : formatCurrency(0);

    return {
      totalMonthSpend,
      totalMonthIncome,
      totalYearSpend,
      totalYearIncome,
      totalMonthSpendIncome,
      totalYearSpendIncome,
      percentageOfIncomeSpentMonth,
      percentageOfIncomeSpentYear,
      totalMonthBudget,
      totalYearBudget,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

export async function fetchEssentialSpendDataByMonth(
  userId: string,
  year: string,
) {
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
        sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}
    AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = true AND ${transactions.isEssential} = true`,
      )
      .groupBy(sql`1`);

    return spendDataByMonth;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch expense data.");
  }
}

export async function fetchNonEssentialSpendDataByMonth(
  userId: string,
  year: string,
) {
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
        sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}
    AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = true AND ${transactions.isEssential} = false`,
      )
      .groupBy(sql`1`);

    return spendDataByMonth;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch expense data.");
  }
}

export async function fetchSpendDataByMonth(userId: string, year: string) {
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
        sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}
    AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = true`,
      )
      .groupBy(sql`1`);

    return spendDataByMonth;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch expense data.");
  }
}

export async function fetchIncomedDataByMonth(userId: string, year: string) {
  try {
    const incomeDataByMonth = await db
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
        sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}
    AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = false`,
      )
      .groupBy(sql`1`);

    return incomeDataByMonth;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch income data.");
  }
}

export async function fetchSpendDataByCategory(userId: string, year: string) {
  try {
    const spendDataByCategory = await db
      .select({
        category: sql<string>`transactions.category`,
        total: sql`sum(transactions.amount) as total`.mapWith({
          mapFromDriverValue: (value: any) => {
            const mappedValue = value / 100;
            return mappedValue;
          },
        }),
      })
      .from(transactions)
      .where(
        sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}
    AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = true`,
      )
      .groupBy(sql`1`);

    return spendDataByCategory;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

export async function fetchSpendDataByCategoryMonthly(
  userId: string,
  month: string,
  year: string,
) {
  try {
    const spendDataByCategory = await db
      .select({
        category: sql<string>`transactions.category`,
        total: sql`sum(transactions.amount) as total`.mapWith({
          mapFromDriverValue: (value: any) => {
            const mappedValue = value / 100;
            return mappedValue;
          },
        }),
      })
      .from(transactions)
      .where(
        sql`EXTRACT(MONTH FROM ${transactions.transactionDate}) = ${month}
        AND EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}
        AND ${transactions.userId} = ${userId} AND ${transactions.isExpense} = true`,
      )
      .groupBy(sql`1`);
    return spendDataByCategory;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

export async function fetchUserBudgetSettings(userId: string) {
  try {
    const data = await db
      .select({
        id: userBudgetSettings.id,
        userId: userBudgetSettings.userId,
        category: userBudgetSettings.category,
        budget: userBudgetSettings.budget,
      })
      .from(userBudgetSettings)
      .where(eq(userBudgetSettings.userId, parseInt(userId)));

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch user budget settings.");
  }
}

export async function fetchUserBudgetByMonth(userId: string) {
  try {
    const data = await db
      .select({
        total: sql`sum(budget)`,
      })
      .from(userBudgetSettings)
      .where(eq(userBudgetSettings.userId, parseInt(userId)));

    return data ? data[0].total : 0;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch user budget settings by month.");
  }
}
