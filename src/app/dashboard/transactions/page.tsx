import { fetchTransactionPages } from "@/app/lib/data";
import Search from "@/app/ui/search";
import { CreateTransaction } from "@/app/ui/transactions/buttons";
import DatePicker from "@/app/ui/transactions/date-picker";
import Pagination from "@/app/ui/transactions/pagination";
import DashboardTable from "@/app/ui/transactions/table";
import DashboardTableMobile from "@/app/ui/transactions/table-mobile";
import { auth } from "@/auth";
import messages from "@/app/lib/data/messages/transactions.json";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    dates?: string;
    page?: string;
  };
}) {
  const session = await auth();
  if (!session) return <div>Not authenticated</div>;
  if (!session.user) return <div>Not authenticated</div>;
  if (!session.user.id) return <div>Not authenticated</div>;

  const currentPage = Number(searchParams?.page) || 1;
  const query = searchParams?.query || "";
  var date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .split("T")[0]
    .replace(/-/g, " ");
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0]
    .replace(/-/g, " ");
  const dates = searchParams?.dates || firstDay + "to" + lastDay;
  const totalPages = await fetchTransactionPages(query, dates, session.user.id);

  console.warn("Date: new Date()", date);
  console.warn("Date: firstDay", firstDay);
  console.warn("Date: lastDay", lastDay);
  console.warn("Date: dates", dates);

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
      <div className="block md:hidden">
        <div>
          <h2>Period: Current Month</h2>
        </div>
      </div>
      <div className="hidden flex md:block">
        <div className=" w-1/2 justify-start">
          <DatePicker placeholder="" />
        </div>
      </div>
      <div className="hidden w-full md:block">
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder={`${messages.transactions.searchPlaceholder}`} />

          <div className="flex justify-center">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
      </div>
      <div className="block w-full md:hidden">
        <Search placeholder={`${messages.transactions.searchPlaceholder}`} />
      </div>

      <div className="hidden w-full md:block">
        <DashboardTable
          query={query}
          dates={dates}
          currentPage={currentPage}
          userId={session.user.id}
        />
      </div>
      <div className="block w-full md:hidden">
        <DashboardTableMobile
          query={query}
          dates={dates}
          currentPage={currentPage}
          userId={session.user.id}
        />
        <div className="flex flex-row p-2 justify-center items-center">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
