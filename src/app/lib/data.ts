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
import { safeDecrypt, encrypt } from "./crypto";

//Create an interface for categories.json and assign to new var categories
interface ICategories {
  [key: string]: string;
}

const categoriesMap: ICategories = getAllCategoriesMap();

const ITEMS_PER_PAGE = 10;

/**
 * Decrypts the amount field from the DB and converts from cents to dollars.
 */
function decryptAmount(encryptedAmount: string | null | undefined): number {
  if (!encryptedAmount) return 0;
  const decrypted = safeDecrypt(encryptedAmount);
  const cents = Number(decrypted);
  if (isNaN(cents)) return 0;
  return cents / 100;
}

/**
 * Decrypts the budget field from the DB (stored in dollars, not cents).
 */
function decryptBudget(encryptedBudget: string | null | undefined): number {
  if (!encryptedBudget) return 0;
  const decrypted = safeDecrypt(encryptedBudget);
  const value = Number(decrypted);
  if (isNaN(value)) return 0;
  return value;
}

export async function fetchAllTransactions(userId: string) {
  const translatedCategoriesMap = await getTranslatedAllCategoriesMap();

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
        amount: transactions.amount,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.transactionDate));

    return data.map((row) => ({
      ...row,
      category: translatedCategoriesMap[row.category] ?? row.category,
      establishment: safeDecrypt(row.establishment),
      amount: decryptAmount(row.amount),
    }));
  } catch (error) {
    throw new Error("Failed to fetch transactions.");
  }
}

export async function fetchTransactionById(id: string, userId: string) {
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
        amount: transactions.amount,
      })
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

    if (!data[0]) return undefined as unknown as TransactionForm;

    const row = data[0];
    return {
      ...row,
      establishment: safeDecrypt(row.establishment),
      amount: decryptAmount(row.amount),
    } as TransactionForm;
  } catch (error) {
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
    // Fetch all transactions in date range for this user, then filter in app layer
    // since establishment is encrypted and can't be searched with ilike
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
        amount: transactions.amount,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          sql`CAST(${transactions.transactionDate} AS DATE) BETWEEN ${startDate} AND ${endDate}`,
        ),
      )
      .orderBy(desc(transactions.transactionDate));

    const queryLower = query.toLowerCase();

    return data
      .map((row) => ({
        ...row,
        category: translatedCategoriesMap[row.category] ?? row.category,
        rawCategory: row.category,
        establishment: safeDecrypt(row.establishment),
        amount: decryptAmount(row.amount),
      }))
      .filter((row) => {
        if (!query) return true;
        // Match by category code, decrypted establishment, or note
        return (
          matchingCodes.includes(row.rawCategory) ||
          row.establishment.toLowerCase().includes(queryLower) ||
          (row.note && row.note.toLowerCase().includes(queryLower))
        );
      })
      .map(({ rawCategory, ...row }) => row);
  } catch (error) {
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

  const dateArray = dates.split("to");
  const startDate = dateArray[0];
  const endDate = dateArray[1];

  const userSettingsData = await fetchUserSettings(userId);
  const userLocale = userSettingsData[0]?.language || "en-US";

  const matchingCodes = Object.entries(translatedCategoriesMap)
    .filter(([code, name]) => name.toLowerCase().includes(query.toLowerCase()))
    .map(([code]) => code);

  try {
    // Fetch all matching transactions for this user in date range,
    // then filter and paginate in app layer since establishment is encrypted
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
        amount: transactions.amount,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          sql`CAST(${transactions.transactionDate} AS DATE) BETWEEN ${startDate} AND ${endDate}`,
        ),
      )
      .orderBy(desc(transactions.transactionDate));

    const queryLower = query.toLowerCase();

    const filtered = data
      .map((row) => ({
        ...row,
        category:
          row.category in translatedCategoriesMap
            ? translatedCategoriesMap[row.category]
            : row.category,
        rawCategory: row.category,
        establishment: safeDecrypt(row.establishment),
        amount: decryptAmount(row.amount),
      }))
      .filter((row) => {
        if (!query) return true;
        return (
          matchingCodes.includes(row.rawCategory) ||
          row.establishment.toLowerCase().includes(queryLower) ||
          (row.note && row.note.toLowerCase().includes(queryLower))
        );
      })
      .map(({ rawCategory, ...row }) => row);

    // Apply pagination in app layer
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(offset, offset + ITEMS_PER_PAGE);
  } catch (error) {
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

    const translatedCategoriesMap = await getTranslatedAllCategoriesMap();
    const matchingCodes = Object.entries(translatedCategoriesMap)
      .filter(([code, name]) =>
        name.toLowerCase().includes(query.toLowerCase()),
      )
      .map(([code]) => code);

    // Fetch all rows in date range, decrypt, filter in app layer, then count
    const data = await db
      .select({
        category: transactions.category,
        establishment: transactions.establishment,
        note: transactions.note,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          sql`CAST(${transactions.transactionDate} AS DATE) BETWEEN ${startDate} AND ${endDate}`,
        ),
      );

    const queryLower = query.toLowerCase();
    const filteredCount = data.filter((row) => {
      if (!query) return true;
      const decryptedEstablishment = safeDecrypt(row.establishment);
      return (
        matchingCodes.includes(row.category) ||
        decryptedEstablishment.toLowerCase().includes(queryLower) ||
        (row.note && row.note.toLowerCase().includes(queryLower))
      );
    }).length;

    const totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
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
    // Fetch all transactions for this user in the given year, then aggregate in app layer
    const yearTransactions = await db
      .select({
        amount: transactions.amount,
        isExpense: transactions.isExpense,
        transactionDate: transactions.transactionDate,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}`,
        ),
      );

    let totalMonthSpendDB = 0;
    let totalMonthIncomeDB = 0;
    let totalYearSpendDB = 0;
    let totalYearIncomeDB = 0;

    for (const tx of yearTransactions) {
      const amountCents = decryptAmount(tx.amount) * 100; // decryptAmount returns dollars, we need cents for consistency
      const txMonth = new Date(tx.transactionDate).getMonth() + 1;

      if (tx.isExpense) {
        totalYearSpendDB += amountCents;
        if (txMonth === Number(month)) {
          totalMonthSpendDB += amountCents;
        }
      } else {
        totalYearIncomeDB += amountCents;
        if (txMonth === Number(month)) {
          totalMonthIncomeDB += amountCents;
        }
      }
    }

    // Fetch budget data and aggregate in app layer
    const budgetRows = await db
      .select({ budget: userBudgetSettings.budget })
      .from(userBudgetSettings)
      .where(eq(userBudgetSettings.userId, userId));

    const totalMonthBudgetDB = budgetRows.reduce(
      (sum, row) => sum + decryptBudget(row.budget),
      0,
    );

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

    // Values are in cents from the loop above — pass directly to formatCurrency
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

    // totalMonthBudgetDB is already in dollars (budget is stored in dollars)
    const totalMonthBudget = totalMonthBudgetDB
      ? await formatCurrency(totalMonthBudgetDB * 100, true, userLocale)
      : await formatCurrency(0, true, userLocale);
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
    throw new Error("Failed to fetch card data.");
  }
}

export async function fetchEssentialSpendDataByMonth(
  userId: string,
  year: string,
) {
  try {
    const data = await db
      .select({
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.isExpense, true),
          eq(transactions.isEssential, true),
          sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}`,
        ),
      );

    // Aggregate by month in app layer
    const monthTotals: Record<number, number> = {};
    for (const row of data) {
      const month = new Date(row.transactionDate).getMonth() + 1;
      const amount = decryptAmount(row.amount);
      monthTotals[month] = (monthTotals[month] || 0) + amount;
    }

    return Object.entries(monthTotals).map(([month, total]) => ({
      month: Number(month),
      total,
    }));
  } catch (error) {
    throw new Error("Failed to fetch expense data.");
  }
}

export async function fetchNonEssentialSpendDataByMonth(
  userId: string,
  year: string,
) {
  try {
    const data = await db
      .select({
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.isExpense, true),
          eq(transactions.isEssential, false),
          sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}`,
        ),
      );

    const monthTotals: Record<number, number> = {};
    for (const row of data) {
      const month = new Date(row.transactionDate).getMonth() + 1;
      const amount = decryptAmount(row.amount);
      monthTotals[month] = (monthTotals[month] || 0) + amount;
    }

    return Object.entries(monthTotals).map(([month, total]) => ({
      month: Number(month),
      total,
    }));
  } catch (error) {
    throw new Error("Failed to fetch expense data.");
  }
}

export async function fetchSpendDataByMonth(userId: string, year: string) {
  try {
    const data = await db
      .select({
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.isExpense, true),
          sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}`,
        ),
      );

    const monthTotals: Record<number, number> = {};
    for (const row of data) {
      const month = new Date(row.transactionDate).getMonth() + 1;
      const amount = decryptAmount(row.amount);
      monthTotals[month] = (monthTotals[month] || 0) + amount;
    }

    return Object.entries(monthTotals).map(([month, total]) => ({
      month: Number(month),
      total,
    }));
  } catch (error) {
    throw new Error("Failed to fetch expense data.");
  }
}

export async function fetchIncomedDataByMonth(userId: string, year: string) {
  try {
    const data = await db
      .select({
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.isExpense, false),
          sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}`,
        ),
      );

    const monthTotals: Record<number, number> = {};
    for (const row of data) {
      const month = new Date(row.transactionDate).getMonth() + 1;
      const amount = decryptAmount(row.amount);
      monthTotals[month] = (monthTotals[month] || 0) + amount;
    }

    return Object.entries(monthTotals).map(([month, total]) => ({
      month: Number(month),
      total,
    }));
  } catch (error) {
    throw new Error("Failed to fetch income data.");
  }
}

export async function fetchSpendDataByCategory(userId: string, year: string) {
  try {
    const data = await db
      .select({
        category: transactions.category,
        amount: transactions.amount,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.isExpense, true),
          sql`EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}`,
        ),
      );

    const categoryTotals: Record<string, number> = {};
    for (const row of data) {
      const amount = decryptAmount(row.amount);
      categoryTotals[row.category] =
        (categoryTotals[row.category] || 0) + amount;
    }

    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
    }));
  } catch (error) {
    throw new Error("Failed to fetch card data.");
  }
}

export async function fetchSpendDataByCategoryMonthly(
  userId: string,
  month: string,
  year: string,
) {
  try {
    const data = await db
      .select({
        category: transactions.category,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.isExpense, true),
          sql`EXTRACT(MONTH FROM ${transactions.transactionDate}) = ${month}
              AND EXTRACT(YEAR FROM ${transactions.transactionDate}) = ${year}`,
        ),
      );

    const categoryTotals: Record<string, number> = {};
    for (const row of data) {
      const amount = decryptAmount(row.amount);
      categoryTotals[row.category] =
        (categoryTotals[row.category] || 0) + amount;
    }

    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
    }));
  } catch (error) {
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

    return data.map((row) => ({
      ...row,
      budget: decryptBudget(row.budget).toString(),
    }));
  } catch (error) {
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
    throw new Error("Failed to fetch user settings.");
  }
}

export async function fetchUserBudgetByMonth(userId: string) {
  try {
    const data = await db
      .select({
        budget: userBudgetSettings.budget,
      })
      .from(userBudgetSettings)
      .where(eq(userBudgetSettings.userId, userId));

    const total = data.reduce((sum, row) => sum + decryptBudget(row.budget), 0);
    return total || 0;
  } catch (error) {
    throw new Error("Failed to fetch user budget settings by month.");
  }
}
