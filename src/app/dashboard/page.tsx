import { auth } from "@/auth";
import { Metadata } from "next";
import { Card } from "../ui/dashboard/cards";
import {
  fetchCardData,
  fetchSpendDataByCategory,
  fetchSpendDataByMonth,
} from "../lib/data";
import ExpensesMonthChart from "../ui/dashboard/expenses-month-chart";
import ExpensesCategoryChart from "../ui/dashboard/expenses-category-chart";
import Toggle from "../ui/dashboard/Toggle";

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
  console.log(searchParams);

  const {
    totalMonthSpend,
    totalMonthIncome,
    totalYearSpend,
    totalYearIncome,
    totalMonthSpendIncome,
    totalYearSpendIncome,
  } = await fetchCardData(session.user.id);

  let totalSpendValue;
  let totalIncomeValue;
  let totalSpendIncomeValue;
  if (currentPeriod === "Month") {
    totalSpendValue = totalMonthSpend;
    totalIncomeValue = totalMonthIncome;
    totalSpendIncomeValue = totalMonthSpendIncome;
  } else {
    totalSpendValue = totalYearSpend;
    totalIncomeValue = totalYearIncome;
    totalSpendIncomeValue = totalYearSpendIncome;
  }

  const spendByMonth = await fetchSpendDataByMonth(session.user.id);
  const spendByCategory = await fetchSpendDataByCategory(session.user.id);

  //Convertspendbymonth to type ExpenseDataMonth

  //create a map from spendbymonth with key as item.month
  const spendByMonthMap = new Map(
    spendByMonth.map((item) => [item.month, item.total]),
  );

  const spendByCategoryMap = new Map(
    spendByCategory.map((item) => [item.category, item.total]),
  );

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
          <ExpensesMonthChart dataExpenses={spendByMonthMap} />
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
