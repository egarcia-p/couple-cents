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
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th></th>
                <th
                  colSpan={2}
                  scope="col"
                  className="px-3 py-5 text-center font-medium"
                >
                  {messages.budget.expenseTable.title}
                </th>
                <th
                  colSpan={2}
                  scope="col"
                  className="px-3 py-5 text-center font-medium"
                >
                  {messages.budget.varianceTable.title}
                </th>
              </tr>
              <tr>
                <th scope="col" className="px-3 py-5 text-center font-medium">
                  {messages.budget.expenseTable.columns.category}
                </th>
                <th scope="col" className="px-3 py-5 text-center font-medium">
                  {messages.budget.expenseTable.columns.expense}
                </th>
                <th scope="col" className="px-3 py-5 text-center font-medium">
                  {messages.budget.expenseTable.columns.budget}
                </th>
                <th scope="col" className="px-3 py-5 text-center font-medium">
                  {messages.budget.varianceTable.columns.variance}
                </th>
                <th scope="col" className="px-3 py-5 text-center font-medium">
                  {messages.budget.varianceTable.columns.percentage}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {budgetVsExpenses.map((category) => {
                const variance = Number(category.budget) - category.expense;
                const percentage = category.budget
                  ? ((variance / Number(category.budget)) * 100).toFixed(2)
                  : "0.00";

                return (
                  <tr
                    key={category.category}
                    className={`w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg`}
                  >
                    <td className="whitespace-nowrap px-3 py-3">
                      {category.category}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {category.expense}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {category.budget}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-3 ${
                        variance < 0 ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {variance}
                    </td>
                    <td
                      className={`whitespace-nowrap px-3 py-3 ${
                        variance < 0 ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
