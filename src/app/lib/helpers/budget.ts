import { UserBudgetSetting } from "../definitions";

export function getBudgetsPerCategorySettings(
  categories: Record<string, string>,
  budgetSettings: UserBudgetSetting[],
) {
  return Object.keys(categories).map((category) => ({
    categoryId: category,
    category: categories[category],
    budget:
      budgetSettings.find((setting) => setting.category === category)?.budget ??
      0,
  }));
}

export function getBudgetsExpensesPerCategorySettings(
  categories: Record<string, string>,
  budgetSettings: UserBudgetSetting[],
  expenses: Map<string, number>,
) {
  return Object.keys(categories).map((category) => ({
    categoryId: category,
    category: categories[category],
    expense: expenses.get(category) ?? 0,
    budget:
      budgetSettings.find((setting) => setting.category === category)?.budget ??
      0,
  }));
}
