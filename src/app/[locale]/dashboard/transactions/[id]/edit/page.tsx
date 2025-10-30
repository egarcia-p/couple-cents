import { notFound } from "next/navigation";
import { Metadata } from "next";
import Form from "@/app/ui/transactions/edit-form";
import { fetchTransactionById } from "@/app/lib/data";
import _categories from "@/app/lib/data/categories.json";
import _categoriesForIncome from "@/app/lib/data/categoriesForIncome.json";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Edit",
};

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [transaction] = await Promise.all([fetchTransactionById(id)]);
  if (!transaction) {
    notFound();
  }

  const locale = cookies().get("NEXT_LOCALE")?.value.toLowerCase() || "en";

  const isExpense = transaction.isExpense;
  let formCategories = {};
  if (isExpense) {
    formCategories = _categories;
  } else {
    formCategories = _categoriesForIncome;
  }

  const t = await getTranslations("TransactionsPage");

  return (
    <main>
      {isExpense && <h1 className="  text-lg">{t("edit.editExpense")}</h1>}
      {!isExpense && <h1 className="  text-lg">{t("edit.editIncome")}</h1>}
      <Form
        transaction={transaction}
        categories={formCategories}
        locale={locale}
      />
    </main>
  );
}
