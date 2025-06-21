import { auth } from "@/auth";
import { Metadata } from "next";
import { UserBudgetSetting } from "@/app/lib/definitions";
import {
  fetchSpendDataByCategory,
  fetchSpendDataByCategoryMonthly,
  fetchUserBudgetSettings,
} from "@/app/lib/data";
import Link from "next/link";
import ExpensesTable from "@/app/components/budget/expenses-table";
import messages from "@/app/lib/data/messages/budget.json";

export const metadata: Metadata = {
  title: "Budget Tracker Dashboard",
};
export default async function Page() {
  const session = await auth();
  if (!session)
    return (
      <div>
        Not authenticated <Link href="/">Go to main page</Link>
      </div>
    );
  const userId = session.user?.id;
  if (!userId)
    return (
      <div>
        Not authenticated <Link href="/">Go to main page</Link>
      </div>
    );

  if (!session.user) return null;
  if (!session.user.id) return null;

  //current period
  const currentPeriod = "Month"; // This can be dynamic based on user selection
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
  );

  let spendByCategoryMap;

  if (currentPeriod === "Month") {
    spendByCategoryMap = new Map(
      spendByCategoryMonthly.map((item) => [item.category, item.total]),
    );
  } else {
    spendByCategoryMap = new Map(
      spendByCategoryYearly.map((item) => [item.category, item.total]),
    );
  }

  return (
    <main>
      <h1 className={`mb-4 text-xl md:text-2xl`}>{messages.budget.title}</h1>

      <div>
        <div>
          <ExpensesTable
            budgetSettings={budgetSettings}
            expenses={spendByCategoryMap}
          />
        </div>
        <div>Other table</div>
      </div>
    </main>
  );
}
