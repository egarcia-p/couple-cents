import { auth } from "@/auth";
import { Metadata } from "next";
import { SignOut } from "../components/signout-button";

export const metadata: Metadata = {
  title: "Dashboard",
};
export default async function Page() {
  const session = await auth();
  console.log(session);
  if (!session) return <div>Not authenticated</div>;

  return (
    <main>
      <h1 className={`mb-4 text-xl md:text-2xl`}>Dashboard</h1>
      <SignOut />
    </main>
  );
}
