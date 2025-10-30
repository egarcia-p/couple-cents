import { Metadata } from "next";
import { UserBudgetSetting } from "@/app/lib/definitions";
import {
  fetchSpendDataByCategory,
  fetchSpendDataByCategoryMonthly,
  fetchUserBudgetSettings,
} from "@/app/lib/data";
import ExpensesTable from "@/app/components/budget/expenses-table";
import Toggle from "@/app/ui/dashboard/Toggle";
import { verifySession } from "@/app/lib/dal";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Budget Tracker Dashboard",
};
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    period?: string;
  };
}) {
  const session = await verifySession();
  if (!session) return null;
  const t = await getTranslations("Budget");
  const userId = session.user?.id;

  const currentPeriod = searchParams?.period || "Month";

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const budgetSettings: UserBudgetSetting[] =
    await fetchUserBudgetSettings(userId);

  const spendByCategoryYearly = await fetchSpendDataByCategory(
    session.user.id,
    currentYear.toString(),
  );
  const spendByCategoryMonthly = await fetchSpendDataByCategoryMonthly(
    session.user.id,
    currentMonth.toString(),
    currentYear.toString(),
  );

  let spendByCategoryMap: Map<string, number>;
  let budgetSettingsMap: UserBudgetSetting[] = [];

  if (currentPeriod === "Month") {
    spendByCategoryMap = new Map(
      spendByCategoryMonthly.map((item) => [item.category, item.total]),
    );
    budgetSettingsMap = budgetSettings;
  } else {
    spendByCategoryMap = new Map(
      spendByCategoryYearly.map((item) => [item.category, item.total]),
    );
    budgetSettingsMap = budgetSettings.map((item) => ({
      id: item.id,
      userId: item.userId,
      category: item.category,
      budget: (Number(item.budget) * 12).toString(),
    }));
  }

  return (
    <main>
      <h1 className={`mb-4 text-xl md:text-2xl`}>{t("title")}</h1>

      <div className="mb-4">
        <Toggle />

        <div className="mb-4 w-full">
          <ExpensesTable
            budgetSettings={budgetSettingsMap}
            expenses={spendByCategoryMap}
          />
        </div>
      </div>
    </main>
  );
}
