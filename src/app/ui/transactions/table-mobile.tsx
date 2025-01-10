import { fetchFilteredTransactions } from "@/app/lib/data";
import { auth } from "../../../auth";
import { DeleteTransaction, UpdateTransaction } from "./buttons";

export default async function DashboardTableMobile({
  query,
  dates,
  currentPage,
  userId,
}: {
  query: string;
  dates: string;
  currentPage: number;
  userId: string;
}) {
  const session = await auth();

  if (!session) return null;

  if (!session.user) return null;

  const transactions = await fetchFilteredTransactions(
    query,
    dates,
    currentPage,
    userId,
  );

  return (
    <div className="mt-2 flex-row ">
      <div className="min-w-full rounded-lg bg-gray-50 p-2 md:pt-0">
        {transactions?.map((transaction) => (
          <div
            key={transaction.id}
            className="flex flex-row justify-between bg-white m-1 rounded-lg"
          >
            <div className="py-3 pl-6 pr-3 inline-block w-1/2">
              <p className="line-clamp-1 ">{transaction.establishment}</p>
            </div>
            <div className="py-3 pl-6 pr-3 font-bold ">
              <span>{transaction.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
