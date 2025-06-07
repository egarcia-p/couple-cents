import { fetchCardData } from "@/app/lib/data";
import { BanknotesIcon, PercentBadgeIcon } from "@heroicons/react/24/outline";
import dashboardMessages from "../../lib/data/messages/dashboard.json";

const iconMap = {
  year: BanknotesIcon,
  month: BanknotesIcon,
  spendIncome: BanknotesIcon,
  percentage: PercentBadgeIcon,
  budget: BanknotesIcon,
};

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: "year" | "month" | "spendIncome" | "percentage" | "budget";
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}

export async function Cards({
  currentPeriod,
  currentMonth,
  currentYear,
  userId,
}: {
  currentPeriod: string;
  currentMonth: number | string;
  currentYear: number | string;
  userId: string;
}) {
  const {
    totalMonthSpend,
    totalMonthIncome,
    totalYearSpend,
    totalYearIncome,
    totalMonthSpendIncome,
    totalYearSpendIncome,
    percentageOfIncomeSpentMonth,
    percentageOfIncomeSpentYear,
    totalMonthBudget,
    totalYearBudget,
  } = await fetchCardData(
    userId,
    currentMonth.toString(),
    currentYear.toString(),
  );

  let totalSpendValue;
  let totalIncomeValue;
  let totalSpendIncomeValue;
  let totalSpendIncomePercentage;
  let totalBudgetValue;
  if (currentPeriod === "Month") {
    totalSpendValue = totalMonthSpend;
    totalIncomeValue = totalMonthIncome;
    totalSpendIncomeValue = totalMonthSpendIncome;
    const totalMonthSpendValue = Number(totalMonthSpend);
    const totalMonthIncomeValue = Number(totalMonthIncome);
    totalSpendIncomePercentage = percentageOfIncomeSpentMonth;
    totalBudgetValue = totalMonthBudget;
  } else {
    totalSpendValue = totalYearSpend;
    totalIncomeValue = totalYearIncome;
    totalSpendIncomeValue = totalYearSpendIncome;
    const totalYearSpendValue = Number(totalYearSpend);
    const totalYearIncomeValue = Number(totalYearIncome);
    totalSpendIncomePercentage = percentageOfIncomeSpentYear;
    totalBudgetValue = totalYearBudget;
  }
  return (
    <>
      <Card
        title={dashboardMessages.dashboard.cards.currentSpend}
        value={totalSpendValue}
        type="month"
      />
      <Card
        title={dashboardMessages.dashboard.cards.currentIncome}
        value={totalIncomeValue}
        type="year"
      />
      <Card
        title={dashboardMessages.dashboard.cards.savings}
        value={totalSpendIncomeValue}
        type="spendIncome"
      />
      <Card
        title={dashboardMessages.dashboard.cards.percentage}
        value={totalSpendIncomePercentage}
        type="percentage"
      />
      <Card
        title={dashboardMessages.dashboard.cards.budget}
        value={totalBudgetValue}
        type="budget"
      />
    </>
  );
}
