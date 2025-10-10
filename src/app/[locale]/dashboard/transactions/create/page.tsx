import Form from "@/app/ui/transactions/create-form";
import { Metadata } from "next";
import categories from "@/app/lib/data/categories.json";
import categoriesForIncome from "@/app/lib/data/categoriesForIncome.json";
import { verifySession } from "@/app/lib/dal";

export const metadata: Metadata = {
  title: "Create",
};

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await verifySession();
  if (!session) return null;

  const isExpense = String(searchParams.isExpense).toLowerCase() === "true";
  let formCategories = {};
  if (isExpense) {
    formCategories = categories;
  } else {
    formCategories = categoriesForIncome;
  }

  return (
    <main>
      {isExpense && <h1 className="  text-lg">Create Expense</h1>}
      {!isExpense && <h1 className="  text-lg">Create Income</h1>}
      <Form
        userId={session.user.id}
        categories={formCategories}
        isExpense={isExpense}
      />
    </main>
  );
}
