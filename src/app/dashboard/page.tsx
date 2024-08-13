import { auth } from "@/auth";
import { Metadata } from "next";
import { Card } from "../ui/dashboard/cards";
import {
  fetchCardData,
  fetchEssentialSpendDataByMonth,
  fetchIncomedDataByMonth,
  fetchNonEssentialSpendDataByMonth,
  fetchSpendDataByCategory,
  fetchSpendDataByCategoryMonthly,
  fetchSpendDataByMonth,
} from "../lib/data";
import ExpensesMonthChart from "../ui/dashboard/expenses-month-chart";
import ExpensesCategoryChart from "../ui/dashboard/expenses-category-chart";
import Toggle from "../ui/dashboard/Toggle";
import EssentialExpensesMonthChart from "../ui/dashboard/essential-expenses-chart";

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
  const session = await auth();
  if (!session) return <div>Not authenticated</div>;
  if (!session.user) return null;
  if (!session.user.id) return null;

  const currentPeriod = searchParams?.period || "Month";

  const {
    totalMonthSpend,
    totalMonthIncome,
    totalYearSpend,
    totalYearIncome,
    totalMonthSpendIncome,
    totalYearSpendIncome,
  } = await fetchCardData(session.user.id);

  const spendByMonth = await fetchSpendDataByMonth(session.user.id);
  const incomeByMonth = await fetchIncomedDataByMonth(session.user.id);
  const spendByCategoryYearly = await fetchSpendDataByCategory(session.user.id);
  const spendByCategoryMonthly = await fetchSpendDataByCategoryMonthly(
    session.user.id,
  );
  const spendEssentialByMonth = await fetchEssentialSpendDataByMonth(
    session.user.id,
  );
  const spendNonEssentialByMonth = await fetchNonEssentialSpendDataByMonth(
    session.user.id,
  );

  //Convertspendbymonth to type ExpenseDataMonth

  //create a map from spendbymonth with key as item.month and incomebymonth
  const spendByMonthMap = new Map(
    spendByMonth.map((item) => [item.month, item.total]),
  );
  const incomeByMonthMap = new Map(
    incomeByMonth.map((item) => [item.month, item.total]),
  );
  const spendEssentialByMonthMap = new Map(
    spendEssentialByMonth.map((month) => [month.month, month.total]),
  );
  const spendNonEssentialByMonthMap = new Map(
    spendNonEssentialByMonth.map((month) => [month.month, month.total]),
  );

  let spendByCategoryMap;

  let totalSpendValue;
  let totalIncomeValue;
  let totalSpendIncomeValue;
  if (currentPeriod === "Month") {
    totalSpendValue = totalMonthSpend;
    totalIncomeValue = totalMonthIncome;
    totalSpendIncomeValue = totalMonthSpendIncome;
    spendByCategoryMap = new Map(
      spendByCategoryMonthly.map((item) => [item.category, item.total]),
    );
  } else {
    totalSpendValue = totalYearSpend;
    totalIncomeValue = totalYearIncome;
    totalSpendIncomeValue = totalYearSpendIncome;
    spendByCategoryMap = new Map(
      spendByCategoryYearly.map((item) => [item.category, item.total]),
    );
  }

  return (
    <main>
      <h1 className={`mb-4 text-xl md:text-2xl`}>Dashboard</h1>
      <Toggle />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Current Spend" value={totalSpendValue} type="month" />
        <Card title="Current Income" value={totalIncomeValue} type="year" />
        <Card
          title="(Income - Spend)"
          value={totalSpendIncomeValue}
          type="spendIncome"
        />
      </div>
      <div className="hidden md:block">
        <div className="h-64 mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
          <ExpensesMonthChart
            dataExpenses={spendByMonthMap}
            dataIncome={incomeByMonthMap}
          />
          <EssentialExpensesMonthChart
            dataEssentialExpenses={spendEssentialByMonthMap}
            dataNonEssentialExpenses={spendNonEssentialByMonthMap}
          />
          <ExpensesCategoryChart dataExpenses={spendByCategoryMap} />
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
