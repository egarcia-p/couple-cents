"use client";

import dynamic from "next/dynamic";
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import { useLocale, useTranslations } from "next-intl";
import { useSpendArray } from "../hooks/useSpendArray";
import { CalendarIcon } from "@heroicons/react/24/outline";
import getHorizontalBarChartOptions from "./horizontal-bar-chart-options";
import { getCategoryColors } from "./chart-colors";

Chart.register(CategoryScale);

const HorizontalBar = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Bar),
  {
    ssr: false,
  },
);

export default function TopExpensesCategoryChart({ dataExpenses }: any) {
  //Conver Info into data array
  const t = useTranslations("TopExpensesCategoryChart");
  const locale = useLocale();
  const horizontalBarOptions = getHorizontalBarChartOptions(locale);
  const { spendArray, categoryArray } = useSpendArray({ dataExpenses });

  // sort spendArray and categoryArray in descending order based on spendArray values
  const sortedData = spendArray
    .map((value, index) => ({ value, category: categoryArray[index] }))
    .sort((a, b) => b.value - a.value);

  const topSpendArray = sortedData.slice(0, 10).map((item) => item.value);
  const topCategoryArray = sortedData.slice(0, 10).map((item) => item.category);

  const categoryColors = getCategoryColors(topCategoryArray);
  const colors = categoryColors.map((c) => c.backgroundColor);
  const borderColors = categoryColors.map((c) => c.borderColor);

  const data = {
    labels: topCategoryArray,
    datasets: [
      {
        axis: "y" as const,
        data: topSpendArray,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1,
        hoverOffset: 4,
        barPercentage: 0.8, // Make bars take up 80% of category width
        categoryPercentage: 1, // Make categories take up 80% of the available height
      },
    ],
  };

  return (
    <div className="h-full w-full md:col-span-4">
      <div className="flex h-full flex-col">
        <div className="rounded-xl">
          <h2 className={`mb-4 text-xl md:text-2xl`}>{t("title")}</h2>
        </div>

        <div className="h-full rounded-xl bg-gray-50 p-4">
          <div className="h-[92%] sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
            <HorizontalBar data={data} options={horizontalBarOptions} />
          </div>
          <div className="flex items-center pb-2 pt-6">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <h3 className="ml-2 text-sm text-gray-500 ">
              {t("currentPeriod")}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
