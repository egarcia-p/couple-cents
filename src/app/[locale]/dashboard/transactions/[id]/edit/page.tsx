import { notFound } from "next/navigation";
import { Metadata } from "next";
import Form from "@/app/ui/transactions/edit-form";
import { fetchTransactionById } from "@/app/lib/data";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { getFormCategories } from "@/app/lib/helpers/categories";

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
  const formCategories = await getFormCategories(isExpense);

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
