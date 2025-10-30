import Form from "@/app/ui/transactions/create-form";
import { Metadata } from "next";
import categories from "@/app/lib/data/categories.json";
import categoriesForIncome from "@/app/lib/data/categoriesForIncome.json";
import { verifySession } from "@/app/lib/dal";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

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

  const t = await getTranslations("TransactionsPage");
  const locale = cookies().get("NEXT_LOCALE")?.value.toLowerCase() || "en";

  const isExpense = String(searchParams.isExpense).toLowerCase() === "true";
  let formCategories = {};
  if (isExpense) {
    formCategories = categories;
  } else {
    formCategories = categoriesForIncome;
  }

  return (
    <main>
      {isExpense && <h1 className="  text-lg">{t("create.createExpense")}</h1>}
      {!isExpense && <h1 className="  text-lg">{t("create.createIncome")}</h1>}
      <Form
        userId={session.user.id}
        categories={formCategories}
        isExpense={isExpense}
        locale={locale}
      />
    </main>
  );
}
