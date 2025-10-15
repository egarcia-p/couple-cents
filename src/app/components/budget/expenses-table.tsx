import { UserBudgetSetting } from "@/app/lib/definitions";
import categories from "@/app/lib/data/categories.json";
import messages from "@/app/lib/data/messages/budget.json";

import {
  getBudgetsExpensesPerCategorySettings,
  getBudgetsPerCategorySettings,
} from "@/app/lib/helpers/budget";
import { formatCurrency, formatPercentage } from "@/app/lib/utils";
import { useTranslations } from "next-intl";

export default function ExpensesTable({
  budgetSettings,
  expenses,
}: {
  budgetSettings: UserBudgetSetting[];
  expenses: Map<string, number>;
}) {
  const t = useTranslations("Budget");
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
    <>
      <div className="hidden w-full md:block">
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
                      {t("expenseTable.title")}
                    </th>
                    <th
                      colSpan={2}
                      scope="col"
                      className="px-3 py-5 text-center font-medium"
                    >
                      {t("varianceTable.title")}
                    </th>
                  </tr>
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-5 text-center font-medium"
                    >
                      {t("expenseTable.columns.category")}
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-5 text-center font-medium"
                    >
                      {t("expenseTable.columns.expense")}
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-5 text-center font-medium"
                    >
                      {t("expenseTable.columns.budget")}
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-5 text-center font-medium"
                    >
                      {t("varianceTable.columns.variance")}
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-5 text-center font-medium"
                    >
                      {t("varianceTable.columns.percentage")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {budgetVsExpenses.map((category) => {
                    const variance = Number(category.budget) - category.expense;
                    const percentage = // Percentage for formatPercentage in 0.00 to 1.00
                      category.budget && Number(category.budget) !== 0
                        ? variance / Number(category.budget)
                        : 0;
                    console.log(percentage);
                    return (
                      <tr
                        key={category.category}
                        className={`w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg`}
                      >
                        <td className="whitespace-nowrap px-3 py-3">
                          {category.category}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {formatCurrency(
                            Number(category.expense) ?? "0",
                            false,
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {formatCurrency(
                            Number(category.budget) ?? "0",
                            false,
                          )}
                        </td>
                        <td
                          className={`whitespace-nowrap px-3 py-3 ${
                            variance < 0 ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {formatCurrency(Number(variance) ?? "0", false)}
                        </td>
                        <td
                          className={`whitespace-nowrap px-3 py-3 ${
                            variance < 0 ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {formatPercentage(percentage)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="block w-full md:hidden">
        {/* Mobile view for expenses table */}
        <div className="mt-6 flow-root">
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
              <table className=" min-w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr>
                    <th></th>
                    <th
                      colSpan={2}
                      scope="col"
                      className="px-3 py-5 text-center font-medium"
                    >
                      {t("varianceTable.title")}
                    </th>
                  </tr>
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-5 text-center font-medium"
                    >
                      {t("expenseTable.columns.category")}
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-5 text-center font-medium"
                    >
                      {t("varianceTable.columns.variance")}
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-5 text-center font-medium"
                    >
                      {t("varianceTable.columns.percentage")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {budgetVsExpenses.map((category) => {
                    const variance = Number(category.budget) - category.expense;
                    const percentage = // Percentage for formatPercentage in 0.00 to 1.00
                      category.budget && Number(category.budget) !== 0
                        ? variance / Number(category.budget)
                        : 0;
                    console.log(percentage);
                    return (
                      <tr
                        key={category.category}
                        className={`w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg`}
                      >
                        <td className="whitespace-nowrap px-3 py-3">
                          {category.category}
                        </td>
                        <td
                          className={`whitespace-nowrap px-3 py-3 ${
                            variance < 0 ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {formatCurrency(Number(variance) ?? "0", false)}
                        </td>
                        <td
                          className={`whitespace-nowrap px-3 py-3 ${
                            variance < 0 ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {formatPercentage(percentage)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
