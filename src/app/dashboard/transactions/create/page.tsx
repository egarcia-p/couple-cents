import Form from "@/app/ui/transactions/create-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create",
};

export default async function Page() {
  return (
    <main>
      <Form />
    </main>
  );
}
