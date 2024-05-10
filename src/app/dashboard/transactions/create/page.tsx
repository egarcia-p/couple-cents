import Form from "@/app/ui/transactions/create-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create",
};

export default async function Page() {
  return (
    <main>
      <h1 className="  text-lg">Create Transaction</h1>
      <Form />
    </main>
  );
}
