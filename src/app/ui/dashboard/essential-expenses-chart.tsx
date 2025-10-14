"use client";

import { CalendarIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import options from "./financial-chart-options";
import { use } from "react";
import { useTranslations } from "next-intl";
Chart.register(CategoryScale);

const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});

export default function EssentialExpensesMonthChart({
  dataEssentialExpenses,
  dataNonEssentialExpenses,
}: any) {
  const t = useTranslations("EssentialExpensesMonthChart");
  const tMonths = useTranslations("months");

  const monthsDisplay = new Map<number, string>();
  monthsDisplay.set(1, tMonths("january"));
  monthsDisplay.set(2, tMonths("february"));
  monthsDisplay.set(3, tMonths("march"));
  monthsDisplay.set(4, tMonths("april"));
  monthsDisplay.set(5, tMonths("may"));
  monthsDisplay.set(6, tMonths("june"));
  monthsDisplay.set(7, tMonths("july"));
  monthsDisplay.set(8, tMonths("august"));
  monthsDisplay.set(9, tMonths("september"));
  monthsDisplay.set(10, tMonths("october"));
  monthsDisplay.set(11, tMonths("november"));
  monthsDisplay.set(12, tMonths("december"));

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  let essentialArray = new Array<number>();
  let nonEssentialArray = new Array<number>();
  let monthArray = new Array<string>();
  months.map((month) => {
    essentialArray.push(dataEssentialExpenses.get(month) | 0);
    nonEssentialArray.push(dataNonEssentialExpenses.get(month) | 0);
    monthArray.push(monthsDisplay.get(month)!);
  });

  //Conver Info into data array
  const data = {
    labels: monthArray,
    datasets: [
      {
        label: t("essentialExpenses"),
        data: essentialArray,
        backgroundColor: [
          "rgba(54, 162, 235, 0.2)", //Green
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)", //Green
        ],
        borderWidth: 1,
      },
      {
        label: t("nonEssentialExpenses"),
        data: nonEssentialArray,
        backgroundColor: ["rgba(255, 99, 132, 0.2)"],
        borderColor: ["rgba(255, 99, 132, 1)"],

        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`mb-4 text-xl md:text-2xl`}>{t("title")}</h2>

      {
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
            <Line data={data} options={options} />
          </div>
          <div className="flex items-center pb-2 pt-6">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <h3 className="ml-2 text-sm text-gray-500 ">{t("currentYear")}</h3>
          </div>
        </div>
      }
    </div>
  );
}
