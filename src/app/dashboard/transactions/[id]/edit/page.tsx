import { notFound } from "next/navigation";
import { Metadata } from "next";
import Form from "@/app/ui/transactions/edit-form";
import { fetchTransactionById } from "@/app/lib/data";

export const metadata: Metadata = {
  title: "Edit",
};

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [transaction] = await Promise.all([fetchTransactionById(id)]);
  if (!transaction) {
    notFound();
  }

  return (
    <main>
      <Form transaction={transaction} />
    </main>
  );
}
