"use client";

import { CalendarIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import { useLocale, useTranslations } from "next-intl";
import { useSpendArray } from "@/app/ui/hooks/useSpendArray";
import getFinancialChartOptions from "./financial-chart-options";
import { getCategoryColors } from "./chart-colors";

Chart.register(CategoryScale);

const Doughnut = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Doughnut),
  {
    ssr: false,
  },
);

export default function ExpensesCategoryChart({ dataExpenses }: any) {
  const t = useTranslations("ExpensesCategoryChart");
  const locale = useLocale();
  const options = getFinancialChartOptions(locale);
  const { spendArray, categoryArray } = useSpendArray({ dataExpenses });

  const categoryColors = getCategoryColors(categoryArray);
  const colors = categoryColors.map((c) => c.backgroundColor);
  const borderColors = categoryColors.map((c) => c.borderColor);

  const data = {
    labels: categoryArray,
    datasets: [
      {
        label: t("label"),
        data: spendArray,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };
  return (
    <div className="w-full md:col-span-4">
      <h2 className={`mb-4 text-xl md:text-2xl`}>{t("title")}</h2>

      {
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
            <Doughnut data={data} options={options} />
          </div>
          <div className="flex items-center pb-2 pt-6">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <h3 className="ml-2 text-sm text-gray-500 ">
              {t("currentPeriod")}
            </h3>
          </div>
        </div>
      }
    </div>
  );
}
