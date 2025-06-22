import { auth } from "@/auth";
import { Metadata } from "next";
import { Card, Cards } from "../../ui/dashboard/cards";
import {
  fetchCardData,
  fetchEssentialSpendDataByMonth,
  fetchIncomedDataByMonth,
  fetchNonEssentialSpendDataByMonth,
  fetchSpendDataByCategory,
  fetchSpendDataByCategoryMonthly,
  fetchSpendDataByMonth,
  fetchUserBudgetByMonth,
} from "../../lib/data";
import ExpensesMonthChart from "@/app/ui/dashboard/expenses-month-chart";
import ExpensesCategoryChart from "@/app/ui/dashboard/expenses-category-chart";
import EssentialExpensesMonthChart from "@/app/ui/dashboard/essential-expenses-chart";
import Filter from "@/app/ui/dashboard/month-year-filter";
import { months } from "@/app/lib/data/months";
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

  const sortedMonths = Object.entries(months).sort(([keyA], [keyB]) =>
    keyA.localeCompare(keyB),
  );

  //if year and month are not provided, return <h1>Select a year and month</h1>
  if (!searchParams?.year && !searchParams?.month) {
    return (
      <main>
        <h1 className={`mb-4 text-xl md:text-2xl`}>
          Please select a year and month
        </h1>
        <Filter months={sortedMonths} years={years} />
      </main>
    );
  }

  const currentYear = searchParams?.year || new Date().getFullYear();
  const currentMonth = searchParams?.month || new Date().getMonth() + 1;

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
      <h1 className={`mb-4 text-xl md:text-2xl`}>History</h1>
      <Filter months={sortedMonths} years={years} />
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <Cards
          currentPeriod={currentPeriod}
          currentMonth={currentMonth}
          currentYear={currentYear}
          userId={session.user.id}
        />
      </div>
      <div className="hidden md:block">
        <div className="h-64 mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
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
