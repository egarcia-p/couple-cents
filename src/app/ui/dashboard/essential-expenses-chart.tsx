"use client";

import { CalendarIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import options from "./financial-chart-options";
Chart.register(CategoryScale);

const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});

export default function EssentialExpensesMonthChart({
  dataEssentialExpenses,
  dataNonEssentialExpenses,
}: any) {
  //Conver Info into data array

  const monthsDisplay = new Map<number, string>();
  monthsDisplay.set(1, "January");
  monthsDisplay.set(2, "February");
  monthsDisplay.set(3, "March");
  monthsDisplay.set(4, "April");
  monthsDisplay.set(5, "May");
  monthsDisplay.set(6, "June");
  monthsDisplay.set(7, "July");
  monthsDisplay.set(8, "August");
  monthsDisplay.set(9, "September");
  monthsDisplay.set(10, "October");
  monthsDisplay.set(11, "November");
  monthsDisplay.set(12, "December");

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  let essentialArray = new Array<number>();
  let nonEssentialArray = new Array<number>();
  let monthArray = new Array<string>();
  months.map((month) => {
    essentialArray.push(dataEssentialExpenses.get(month) | 0);
    nonEssentialArray.push(dataNonEssentialExpenses.get(month) | 0);
    monthArray.push(monthsDisplay.get(month)!);
  });

  const data = {
    labels: monthArray,
    datasets: [
      {
        label: "Essential Expenses",
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
        label: "Non-Essential Expenses",
        data: nonEssentialArray,
        backgroundColor: ["rgba(255, 99, 132, 0.2)"],
        borderColor: ["rgba(255, 99, 132, 1)"],

        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`mb-4 text-xl md:text-2xl`}>Expenses by Month</h2>

      {
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
            <Line data={data} options={options} />
          </div>
          <div className="flex items-center pb-2 pt-6">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <h3 className="ml-2 text-sm text-gray-500 ">Current Year</h3>
          </div>
        </div>
      }
    </div>
  );
}
