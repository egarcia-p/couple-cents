import { CreateTransaction } from "@/app/ui/transactions/buttons";
import DashboardTable from "@/app/ui/transactions/table";
import DashboardTableMobile from "@/app/ui/transactions/table-mobile";
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();
  if (!session) return <div>Not authenticated</div>;
  if (!session.user) return <div>Not authenticated</div>;
  if (!session.user.id) return <div>Not authenticated</div>;

  return (
    <div className="w-full">
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <h1 className="text-lg font-bold">Transactions</h1>

        <CreateTransaction />
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <h1 className="text-lg">Searchbox</h1>
        {/* Add Pagination Here */}
      </div>
      <div className="hidden w-full md:block">
        <DashboardTable userId={session.user.id} />
      </div>
      <div className="block w-full md:hidden">
        <DashboardTableMobile userId={session.user.id} />
      </div>
    </div>
  );
}
