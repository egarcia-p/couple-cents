"use client";

import { saveBudgetSettings } from "@/app/lib/actions";
import profileMessages from "@/app/lib/data/messages/profile.json";
import { Button } from "@/app/ui/button";
import { BudgetField } from "@/app/ui/profile/budget-field";
import { int } from "drizzle-orm/mysql-core";
import { useFormState } from "react-dom";

export default function UserSettings() {
  const budgetSettings = [
    {
      user_id: "userId",
      category_id: "categoryId",
      budget: 100,
    },
    {
      user_id: "userId",
      category_id: "categoryId2",
      budget: 200,
    },
  ];
  const initialState = { message: "", errors: {} };
  const [state, dispatch] = useFormState(saveBudgetSettings, initialState);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 ">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold">
              {profileMessages.settings.budget.title}
            </h1>
            <form action={dispatch}>
              <div className="ml-4 flex flex-col gap-2">
                {budgetSettings.map((setting) => (
                  <BudgetField
                    key={setting.category_id}
                    category={setting.category_id}
                    budget={setting.budget}
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
