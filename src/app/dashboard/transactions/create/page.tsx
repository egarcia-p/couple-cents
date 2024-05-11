import Form from "@/app/ui/transactions/create-form";
import { auth } from "@/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create",
};

export default async function Page() {
  const session = await auth();

  if (!session) return null;
  if (!session.user) return null;
  if (!session.user.id) return null;
  return (
    <main>
      <h1 className="  text-lg">Create Transaction</h1>
      <Form userId={session.user.id} />
    </main>
  );
}
