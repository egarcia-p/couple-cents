"use client";

import { saveBudgetSettings } from "@/app/lib/actions";
import { fetchUserBudgetSettings } from "@/app/lib/data";
import profileMessages from "@/app/lib/data/messages/profile.json";
import { Button } from "@/app/ui/button";
import { BudgetField } from "@/app/ui/profile/budget-field";
import { int } from "drizzle-orm/mysql-core";
import { useFormState } from "react-dom";
import { use, useEffect, useState } from "react";
import categories from "@/app/lib/data/categories.json";
import {
  UserBudgetSetting,
  UserBudgetSettingForm,
} from "../../lib/definitions";

export default function UserSettings({
  userId,
  budgetSettings,
}: {
  userId: string;
  budgetSettings: UserBudgetSetting[];
}) {
  const initialState = { message: "", errors: {} };
  const [state, dispatch] = useFormState(saveBudgetSettings, initialState);
  const [totalBudget, setTotalBudget] = useState(0);

  const budgetsPerCategorySettings = Object.keys(categories).map(
    (category) => ({
      categoryId: category,
      category: categories[category as keyof typeof categories],
      budget: budgetSettings.find((setting) => setting.category === category)
        ? budgetSettings.find((setting) => setting.category === category)
            ?.budget
        : 0,
    }),
  );

  const initialBudgetValues: Record<string, number> = {};
  budgetsPerCategorySettings.forEach((setting) => {
    initialBudgetValues[setting.categoryId] = Number(setting.budget) || 0;
  });
  console.log("Initial budget values", initialBudgetValues);

  const [budgetValues, setBudgetValues] =
    useState<Record<string, number>>(initialBudgetValues);

  const handleBudgetChange = (categoryId: string, value: string) => {
    console.log("Budget change", categoryId, value);
    setBudgetValues((prev) => ({
      ...prev,
      [categoryId]: Number(value) || 0,
    }));
  };

  useEffect(() => {
    let total = Object.values(budgetValues).reduce(
      (sum, value) => sum + value,
      0,
    );
    total *= 12;
    setTotalBudget(total);
  }, [budgetValues]);

  const categoriesMap = Object.entries(categories);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 ">
          <div className="ml-4 mt-4 flex flex-col gap-4">
            <h1 className="text-xl font-bold">
              {profileMessages.settings.budget.title}
            </h1>
            <form action={dispatch}>
              <input type="hidden" name="userId" value={userId} />
              <div className="flex flex-col gap-2">
                {budgetsPerCategorySettings.map((setting) => (
                  <BudgetField
                    key={setting.category}
                    categoryId={setting.categoryId}
                    category={setting.category}
                    budget={String(setting.budget ?? "")}
                    onBudgetChange={handleBudgetChange}
                  />
                ))}
                <div>
                  <h2>Anual Budget</h2>
                  <p className="text-lg font-semibold">
                    ${totalBudget.toLocaleString()}
                  </p>
                </div>
                <div className="flex w-full justify-left">
                  <Button type="submit">Save Budget</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
