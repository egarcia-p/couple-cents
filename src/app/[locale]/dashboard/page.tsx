import { Metadata } from "next";
import { Cards } from "@/app/ui/dashboard/cards";
import {
  fetchCardData,
  fetchEssentialSpendDataByMonth,
  fetchIncomedDataByMonth,
  fetchNonEssentialSpendDataByMonth,
  fetchSpendDataByCategory,
  fetchSpendDataByCategoryMonthly,
  fetchSpendDataByMonth,
  fetchUserBudgetByMonth,
} from "@/app/lib/data";
import ExpensesMonthChart from "@/app/ui/dashboard/expenses-month-chart";
import ExpensesCategoryChart from "@/app/ui/dashboard/expenses-category-chart";
import Toggle from "@/app/ui/dashboard/Toggle";
import EssentialExpensesMonthChart from "@/app/ui/dashboard/essential-expenses-chart";
import { verifySession } from "@/app/lib/dal";
import { getTranslations } from "next-intl/server";
import TopExpensesCategoryChart from "@/app/ui/dashboard/top-expenses-category-chart";

export const metadata: Metadata = {
  title: "Dashboard",
};
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    period?: string;
  };
}) {
  const t = await getTranslations("DashboardPage");
  const session = await verifySession();
  if (!session) return null;

  const currentPeriod = searchParams?.period || "Month";

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  //get budget
  const totalBudgetByMonth = await fetchUserBudgetByMonth(session.user.id);

  const spendByMonth = await fetchSpendDataByMonth(
    session.user.id,
    currentYear.toString(),
  );
  const incomeByMonth = await fetchIncomedDataByMonth(
    session.user.id,
    currentYear.toString(),
  );
  const spendByCategoryYearly = await fetchSpendDataByCategory(
    session.user.id,
    currentYear.toString(),
  );
  const spendByCategoryMonthly = await fetchSpendDataByCategoryMonthly(
    session.user.id,
    currentMonth.toString(),
    currentYear.toString(),
  );
  const spendEssentialByMonth = await fetchEssentialSpendDataByMonth(
    session.user.id,
    currentYear.toString(),
  );
  const spendNonEssentialByMonth = await fetchNonEssentialSpendDataByMonth(
    session.user.id,
    currentYear.toString(),
  );

  //Convertspendbymonth to type ExpenseDataMonth

  //create a map from spendbymonth with key as item.month and incomebymonth
  const spendByMonthMap = new Map(
    spendByMonth.map((item) => [Number(item.month), item.total]),
  );
  const incomeByMonthMap = new Map(
    incomeByMonth.map((item) => [Number(item.month), item.total]),
  );
  const spendEssentialByMonthMap = new Map(
    spendEssentialByMonth.map((month) => [Number(month.month), month.total]),
  );
  const spendNonEssentialByMonthMap = new Map(
    spendNonEssentialByMonth.map((month) => [Number(month.month), month.total]),
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
      <h1 className={`mb-4 text-xl md:text-2xl`}>{t("Dashboard")}</h1>
      <Toggle />
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Cards
          currentPeriod={currentPeriod}
          currentMonth={currentMonth}
          currentYear={currentYear}
          userId={session.user.id}
        />
      </div>
      <div className="hidden md:block">
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
          <ExpensesMonthChart
            dataExpenses={spendByMonthMap}
            dataIncome={incomeByMonthMap}
            budget={Number(totalBudgetByMonth)} // Replace with your budget value
          />
          <EssentialExpensesMonthChart
            dataEssentialExpenses={spendEssentialByMonthMap}
            dataNonEssentialExpenses={spendNonEssentialByMonthMap}
          />
          <ExpensesCategoryChart dataExpenses={spendByCategoryMap} />
          <TopExpensesCategoryChart dataExpenses={spendByCategoryMap} />
        </div>
        {/* <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense> */}
      </div>
    </main>
  );
}
