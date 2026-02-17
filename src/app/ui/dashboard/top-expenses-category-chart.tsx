"use client";

import dynamic from "next/dynamic";
import { CategoryScale, scales } from "chart.js";
import Chart from "chart.js/auto";
import { useTranslations } from "next-intl";
import { useSpendArray } from "../hooks/useSpendArray";
import { CalendarIcon } from "@heroicons/react/24/outline";
import options from "./financial-chart-options";
import { off } from "process";
import { min } from "drizzle-orm";

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
  const { spendArray, categoryArray } = useSpendArray({ dataExpenses });

  // sort spendArray and categoryArray in descending order based on spendArray values
  const sortedData = spendArray
    .map((value, index) => ({ value, category: categoryArray[index] }))
    .sort((a, b) => b.value - a.value);

  const topSpendArray = sortedData.slice(0, 10).map((item) => item.value);
  const topCategoryArray = sortedData.slice(0, 10).map((item) => item.category);

  //TODO check how to match colors with other charts
  const colors = [
    "rgba(255, 99, 132, 0.2)",
    "rgba(54, 162, 235, 0.2)",
    "rgba(75, 192, 192, 0.2)",
    "rgba(255, 206, 86, 0.2)",
    "rgba(153, 102, 255, 0.2)",
    "rgba(255, 159, 64, 0.2)",
    "rgba(255, 99, 64, 0.2)",
    "rgba(54, 162, 64, 0.2)",
    "rgba(255, 206, 132, 0.2)",
    "rgba(75, 192, 235, 0.2)",
    "rgba(153, 102, 86, 0.2)",
    "rgba(255, 159, 192, 0.2)",
    "rgba(255, 99, 255, 0.2)",
    "rgba(54, 162, 99, 0.2)",
    "rgba(255, 206, 153, 0.2)",
    "rgba(75, 192, 64, 0.2)",
    "rgba(153, 102, 235, 0.2)",
    "rgba(255, 159, 132, 0.2)",
  ];

  const borderColors = [
    "rgba(255, 99, 132, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 159, 64, 1)",
    "rgba(255, 99, 64, 1)",
    "rgba(54, 162, 64, 1)",
    "rgba(255, 206, 132, 1)",
    "rgba(75, 192, 235, 1)",
    "rgba(153, 102, 86, 1)",
    "rgba(255, 159, 192, 1)",
    "rgba(255, 99, 255, 1)",
    "rgba(54, 162, 99, 1)",
    "rgba(255, 206, 153, 1)",
    "rgba(75, 192, 64, 1)",
    "rgba(153, 102, 235, 1)",
    "rgba(255, 159, 132, 1)",
  ];

  const data = {
    labels: topCategoryArray,
    datasets: [
      {
        axis: "y" as const,
        label: t("label"),
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

  const options = {
    indexAxis: "y" as const,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        ticks: {
          autoSkip: false,
          maxRotation: 90, // Optional: Rotate labels to fit
          minRotation: 0,
        },
      },
    },
  };

  return (
    <div className="h-full w-full md:col-span-4">
      <div className="flex h-full flex-col">
        <div className="rounded-xl">
          <h2 className={`mb-4 text-xl md:text-2xl`}>{t("title")}</h2>
        </div>

        <div className="h-full rounded-xl bg-gray-50 p-4">
          <div className="h-[92%] sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
            <HorizontalBar data={data} options={options} />
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
