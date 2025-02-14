import { auth } from "@/auth";
import { Metadata } from "next";
import { Card } from "../../ui/dashboard/cards";
import {
  fetchCardData,
  fetchEssentialSpendDataByMonth,
  fetchIncomedDataByMonth,
  fetchNonEssentialSpendDataByMonth,
  fetchSpendDataByCategory,
  fetchSpendDataByCategoryMonthly,
  fetchSpendDataByMonth,
} from "../../lib/data";
import ExpensesMonthChart from "@/app/ui/dashboard/expenses-month-chart";
import ExpensesCategoryChart from "@/app/ui/dashboard/expenses-category-chart";
import Toggle from "@/app/ui/dashboard/Toggle";
import EssentialExpensesMonthChart from "@/app/ui/dashboard/essential-expenses-chart";
import Filter from "@/app/ui/dashboard/month-year-filter";
import months from "@/app/lib/data/months.json";
import years from "@/app/lib/data/years.json";

export const metadata: Metadata = {
  title: "History",
};
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    period?: string;
    year?: string;
    month?: string;
  };
}) {
  const session = await auth();
  if (!session) return <div>Not authenticated</div>;
  if (!session.user) return null;
  if (!session.user.id) return null;

  let currentPeriod = "Month";

  if (searchParams?.month == "00") {
    currentPeriod = "Year";
  }

  const currentYear = searchParams?.year || new Date().getFullYear();
  const currentMonth = searchParams?.month || new Date().getMonth() + 1;

  const {
    totalMonthSpend,
    totalMonthIncome,
    totalYearSpend,
    totalYearIncome,
    totalMonthSpendIncome,
    totalYearSpendIncome,
  } = await fetchCardData(
    session.user.id,
    currentMonth.toString(),
    currentYear.toString(),
  );

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
      <h1 className={`mb-4 text-xl md:text-2xl`}>History</h1>
      <Filter months={months} years={years} />
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
