import { use } from "react";
import {
  transactions,
  userBudgetSettings,
  userSettings,
} from "../../../drizzle/schema";
import { db } from "./db";
import { TransactionForm } from "./definitions";
import { formatCurrency, formatPercentage } from "./utils";
import { and, or, ilike, sql, eq, count, sum, desc } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import {
  getAllCategoriesMap,
  getTranslatedAllCategoriesMap,
} from "./helpers/categories";

//Create an interface for categories.json and assign to new var categories
interface ICategories {
  [key: string]: string;
}

const categoriesMap: ICategories = getAllCategoriesMap();

const ITEMS_PER_PAGE = 10;

export async function fetchAllTransactions(userId: string) {
  const translatedCategoriesMap = await getTranslatedAllCategoriesMap();

  try {
    const data = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        transactionDate: transactions.transactionDate,
        category: sql<string>`category`.mapWith({
          mapFromDriverValue: (value: string) => {
            const mappedValue = translatedCategoriesMap[value];
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
      .where(eq(transactions.userId, userId))
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

export async function fetchAllFilteredTransactions({
  query,
  dates,
  userId,
}: {
  query: string;
  dates: string;
  userId: string;
}) {
  const translatedCategoriesMap = await getTranslatedAllCategoriesMap();

  const dateArray = dates.split("to");
  const startDate = dateArray[0];
  const endDate = dateArray[1];

  const userSettingsData = await fetchUserSettings(userId);
  const userLocale = userSettingsData[0]?.language || "en-US";

  const matchingCodes = Object.entries(translatedCategoriesMap)
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
            const mappedValue = translatedCategoriesMap[value];
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
            return (value / 100).toString();
          },
        }),
      })
      .from(transactions)
      .where(
        and(
          or(
            ...matchingCodes.map((code) => eq(transactions.category, code)),
            ilike(transactions.establishment, `%${query}%`),
            ilike(transactions.note, `%${query}%`),
          ),
          eq(transactions.userId, userId),
          sql`CAST(${transactions.transactionDate} AS DATE) BETWEEN ${startDate} AND ${endDate}`,
        ),
      )
      .orderBy(desc(transactions.transactionDate));

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch all transactions filtered.");
  }
}

export async function fetchFilteredTransactions(
  query: string,
  dates: string,
  currentPage: number,
  userId: string,
) {
  const translatedCategoriesMap = await getTranslatedAllCategoriesMap();

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const dateArray = dates.split("to");
  const startDate = dateArray[0];
  const endDate = dateArray[1];

  const userSettingsData = await fetchUserSettings(userId);
  const userLocale = userSettingsData[0]?.language || "en-US";

  const matchingCodes = Object.entries(translatedCategoriesMap)
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
            const mappedValue =
              value in translatedCategoriesMap
                ? translatedCategoriesMap[value]
                : value;
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
            return (value / 100).toString();
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
          eq(transactions.userId, userId),
          sql`CAST(${transactions.transactionDate} AS DATE) BETWEEN ${startDate} AND ${endDate}`,
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
          eq(transactions.userId, userId),
          sql`CAST(${transactions.transactionDate} AS DATE) BETWEEN ${startDate} AND ${endDate}`,
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
  const t = await getTranslations("DB");
  const userSettingsData = await fetchUserSettings(userId);
  const userLocale = userSettingsData[0]?.language || "en-US";

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
      percentageOfIncomeSpentMonth = t("noIncome");
    }

    if (totalYearIncomeDB > 0) {
      percentageOfIncomeSpentYear = totalYearSpendDB / totalYearIncomeDB;
      percentageOfIncomeSpentYear = formatPercentage(
        Number(percentageOfIncomeSpentYear),
      );
    } else {
      percentageOfIncomeSpentYear = t("noIncome");
    }

    const totalMonthSpend = await formatCurrency(
      totalMonthSpendDB ?? "0",
      true,
      userLocale,
    );
    const totalYearSpend = await formatCurrency(
      totalYearSpendDB ?? "0",
      true,
      userLocale,
    );
    const totalMonthIncome = await formatCurrency(
      totalMonthIncomeDB ?? "0",
      true,
      userLocale,
    );
    const totalYearIncome = await formatCurrency(
      totalYearIncomeDB ?? "0",
      true,
      userLocale,
    );
    const totalMonthSpendIncome = await formatCurrency(
      totalMonthIncomeDB - totalMonthSpendDB,
      true,
      userLocale,
    );
    const totalYearSpendIncome = await formatCurrency(
      totalYearIncomeDB - totalYearSpendDB,
      true,
      userLocale,
    );

    const totalMonthBudget = totalMonthBudgetDB
      ? await formatCurrency(totalMonthBudgetDB * 100, true, userLocale) //convert from cents to dollars
      : await formatCurrency(0, true, userLocale);
    //Calculate total year budget
    const totalYearBudget = totalMonthBudgetDB
      ? await formatCurrency(totalMonthBudgetDB * 100 * 12, true, userLocale)
      : await formatCurrency(0, true, userLocale);

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
      .where(eq(userBudgetSettings.userId, userId));

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch user budget settings.");
  }
}

export async function fetchUserSettings(userId: string) {
  try {
    const data = await db
      .select({
        id: userSettings.id,
        userId: userSettings.userId,
        language: userSettings.language,
        timezone: userSettings.timezone,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch user settings.");
  }
}

export async function fetchUserBudgetByMonth(userId: string) {
  try {
    const data = await db
      .select({
        total: sql`sum(budget)`,
      })
      .from(userBudgetSettings)
      .where(eq(userBudgetSettings.userId, userId));

    return data ? data[0].total : 0;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch user budget settings by month.");
  }
}
