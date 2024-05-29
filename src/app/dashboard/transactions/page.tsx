import { fetchTransactionPages } from "@/app/lib/data";
import Search from "@/app/ui/search";
import { CreateTransaction } from "@/app/ui/transactions/buttons";
import Pagination from "@/app/ui/transactions/pagination";
import DashboardTable from "@/app/ui/transactions/table";
import DashboardTableMobile from "@/app/ui/transactions/table-mobile";
import { auth } from "@/auth";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const session = await auth();
  if (!session) return <div>Not authenticated</div>;
  if (!session.user) return <div>Not authenticated</div>;
  if (!session.user.id) return <div>Not authenticated</div>;

  const currentPage = Number(searchParams?.page) || 1;
  const query = searchParams?.query || "";
  const totalPages = await fetchTransactionPages(query, session.user.id);

  return (
    <div className="w-full">
      <div className="mt-4 flex justify-between gap-2 md:mt-8">
        <div className="justify-start">
          <h1 className="text-lg font-bold">Transactions</h1>
        </div>
        <div className="flex justify-end gap-2">
          <CreateTransaction isExpense={true} />
          <CreateTransaction isExpense={false} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />

        <div className="">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
      <div className="hidden w-full md:block">
        <DashboardTable
          query={query}
          currentPage={currentPage}
          userId={session.user.id}
        />
      </div>
      <div className="block w-full md:hidden">
        <DashboardTableMobile
          query={query}
          currentPage={currentPage}
          userId={session.user.id}
        />
      </div>
    </div>
  );
}
