import { auth } from "@/auth";
import { Metadata } from "next";
import { Card } from "../ui/dashboard/cards";
import { fetchCardData, fetchSpendDataByMonth } from "../lib/data";
import ExpensesMonthChart from "../ui/dashboard/expenses-month-chart";
import { ExpenseDataMonth } from "../lib/definitions";

export const metadata: Metadata = {
  title: "Dashboard",
};
export default async function Page() {
  const session = await auth();
  if (!session) return <div>Not authenticated</div>;
  if (!session.user) return null;
  if (!session.user.id) return null;

  const { totalMonthSpend, totalYearSpend } = await fetchCardData(
    session.user.id,
  );
  const totalIncomeSpend = "TBD";

  const spendByMonth = await fetchSpendDataByMonth(session.user.id);

  //Convertspendbymonth to type ExpenseDataMonth

  //create a map from spendbymonth with key as item.month
  const spendByMonthMap = new Map(
    spendByMonth.map((item) => [item.month, item.total]),
  );

  return (
    <main>
      <h1 className={`mb-4 text-xl md:text-2xl`}>Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Current Month Spend"
          value={totalMonthSpend}
          type="month"
        />
        <Card title="Current Year Spend" value={totalYearSpend} type="year" />
        <Card title="Income - Spend" value={totalIncomeSpend} type="spend" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <ExpensesMonthChart dataExpenses={spendByMonthMap} />
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
