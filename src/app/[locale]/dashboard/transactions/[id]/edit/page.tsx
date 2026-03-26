import { notFound } from "next/navigation";
import { Metadata } from "next";
import Form from "@/app/ui/transactions/edit-form";
import { fetchTransactionById, fetchUserTags } from "@/app/lib/data";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { getFormCategories } from "@/app/lib/helpers/categories";
import { verifySession } from "@/app/lib/dal";

export const metadata: Metadata = {
  title: "Edit",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await verifySession();
  const [transaction, userTags] = await Promise.all([
    fetchTransactionById(id, session.user.id),
    fetchUserTags(session.user.id),
  ]);
  if (!transaction) {
    notFound();
  }

  const locale =
    (await cookies()).get("NEXT_LOCALE")?.value.toLowerCase() || "en";

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
        availableTags={userTags}
      />
    </main>
  );
}
