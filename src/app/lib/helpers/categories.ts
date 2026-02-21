import { getTranslations } from "next-intl/server";
import categories from "@/app/lib/data/categories.json";
import categoriesForIncome from "@/app/lib/data/categoriesForIncome.json";
import { Categories } from "../definitions";

/**
 * Translates category keys to localized category names
 * Server-side helper for use in Server Components
 */
export async function getTranslatedCategories(
  categoryData: Categories,
): Promise<Categories> {
  const tCategories = await getTranslations("Categories");

  const translatedCategories: Categories = {};
  Object.keys(categoryData).forEach((categoryKey) => {
    translatedCategories[categoryKey] = tCategories(categoryKey);
  });

  return translatedCategories;
}

/**
 * Gets the appropriate category set (expenses or income) and translates them
 * Server-side helper for use in Server Components
 */
export async function getFormCategories(
  isExpense: boolean,
): Promise<Categories> {
  const categoryData = isExpense ? categories : categoriesForIncome;
  return getTranslatedCategories(categoryData as Categories);
}

/**
 * Gets expense categories object
 */
export function getExpenseCategories(): Categories {
  return categories as Categories;
}

/**
 * Gets income categories object
 */
export function getIncomeCategories(): Categories {
  return categoriesForIncome as Categories;
}
