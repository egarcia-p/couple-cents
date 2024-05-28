import Form from "@/app/ui/transactions/create-form";
import { auth } from "@/auth";
import { Metadata } from "next";
import categories from "../../../lib/data/categories.json";
import categoriesForIncome from "../../../lib/data/categoriesForIncome.json";

export const metadata: Metadata = {
  title: "Create",
};

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();

  if (!session) return null;
  if (!session.user) return null;
  if (!session.user.id) return null;

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
