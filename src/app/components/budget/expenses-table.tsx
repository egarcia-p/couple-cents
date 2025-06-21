import { UserBudgetSetting } from "@/app/lib/definitions";
import categories from "@/app/lib/data/categories.json";
import messages from "@/app/lib/data/messages/budget.json";

import {
  getBudgetsExpensesPerCategorySettings,
  getBudgetsPerCategorySettings,
} from "@/app/lib/helpers/budget";

export default function ExpensesTable({
  budgetSettings,
  expenses,
}: {
  budgetSettings: UserBudgetSetting[];
  expenses: Map<string, number>;
}) {
  const budgetsPerCategorySettings = getBudgetsPerCategorySettings(
    categories,
    budgetSettings,
  );

  const budgetVsExpenses = getBudgetsExpensesPerCategorySettings(
    categories,
    budgetSettings,
    expenses,
  );

  return (
    <div>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th></th>
            <th colSpan={2} className="px-4 py-2 text-center">
              {messages.budget.expenseTable.title}
            </th>
          </tr>
          <tr>
            <th className="px-4 py-2">
              {messages.budget.expenseTable.columns.category}
            </th>
            <th className="px-4 py-2">
              {messages.budget.expenseTable.columns.expense}
            </th>
            <th className="px-4 py-2">
              {messages.budget.expenseTable.columns.budget}
            </th>
          </tr>
        </thead>
        <tbody>
          {budgetVsExpenses.map((category) => {
            return (
              <tr key={category.category}>
                <td className="px-4 py-2">{category.category}</td>
                <td className="px-4 py-2">{category.expense}</td>
                <td className="px-4 py-2">{category.budget}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
