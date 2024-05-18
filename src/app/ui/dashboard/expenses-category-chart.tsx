"use client";

import { CalendarIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import categories from "@/app/lib/data/categories.json";
Chart.register(CategoryScale);

interface Category {
  id: string;
  name: string;
}
interface Categories {
  [key: string]: string;
}

const Doughnut = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Doughnut),
  {
    ssr: false,
  },
);

export default function ExpensesCategoryChart({ dataExpenses }: any) {
  //Conver Info into data array
  const allCategories = categories as Categories;

  let spendArray = new Array<number>();
  let categoryArray = new Array<string>();
  Object.keys(allCategories).forEach((categoryKey) => {
    spendArray.push(dataExpenses.get(categoryKey) | 0);
    categoryArray.push(allCategories[categoryKey]);
  });

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
    labels: categoryArray,
    datasets: [
      {
        label: "Expense Chart",
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
      <h2 className={`mb-4 text-xl md:text-2xl`}>Expenses by Category</h2>

      {
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
            <Doughnut data={data} />
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
