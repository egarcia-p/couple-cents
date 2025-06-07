"use client";

import { saveBudgetSettings } from "@/app/lib/actions";
import { fetchUserBudgetSettings } from "@/app/lib/data";
import profileMessages from "@/app/lib/data/messages/profile.json";
import { Button } from "@/app/ui/button";
import { BudgetField } from "@/app/ui/profile/budget-field";
import { int } from "drizzle-orm/mysql-core";
import { useFormState } from "react-dom";
import { use } from "react";
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

  const categoriesMap = Object.entries(categories);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 ">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold">
              {profileMessages.settings.budget.title}
            </h1>
            <form action={dispatch}>
              <input type="hidden" name="userId" value={userId} />
              <div className="ml-4 flex flex-col gap-2">
                {budgetsPerCategorySettings.map((setting) => (
                  <BudgetField
                    key={setting.category}
                    categoryId={setting.categoryId}
                    category={setting.category}
                    budget={String(setting.budget ?? "")}
                  />
                ))}
                <div className="flex w-full justify-center">
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
