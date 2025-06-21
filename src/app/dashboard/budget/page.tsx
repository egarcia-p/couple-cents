import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budget Tracker Dashboard",
};
export default async function Page() {
  return (
    <main>
      <h1 className={`mb-4 text-xl md:text-2xl`}>Budget Tracker Dashboard</h1>
      <p>Welcome to the Budget Tracker Dashboard!</p>
      <p>Here you can manage your budget and track your expenses.</p>
      <p>Stay tuned for more features!</p>
    </main>
  );
}
