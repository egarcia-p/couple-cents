import { notFound } from "next/navigation";
import { Metadata } from "next";
import Form from "@/app/ui/transactions/edit-form";
import { fetchTransactionById } from "@/app/lib/data";
import _categories from "../../../../lib/data/categories.json";
import _categoriesForIncome from "@/app/lib/data/categoriesForIncome.json";

export const metadata: Metadata = {
  title: "Edit",
};

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [transaction] = await Promise.all([fetchTransactionById(id)]);
  if (!transaction) {
    notFound();
  }

  const isExpense = transaction.isExpense;
  let formCategories = {};
  if (isExpense) {
    formCategories = _categories;
  } else {
    formCategories = _categoriesForIncome;
  }

  return (
    <main>
      {isExpense && <h1 className="  text-lg">Edit Expense</h1>}
      {!isExpense && <h1 className="  text-lg">Edit Income</h1>}
      <Form transaction={transaction} categories={formCategories} />
    </main>
  );
}
