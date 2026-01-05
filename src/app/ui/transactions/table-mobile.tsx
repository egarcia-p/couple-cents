import { fetchFilteredTransactions, fetchUserSettings } from "@/app/lib/data";
import { DeleteTransaction, UpdateTransaction } from "./buttons";
import { verifySession } from "@/app/lib/dal";
import { userSettings } from "../../../../drizzle/schema";
import { tr } from "@faker-js/faker";
import { formatCurrency } from "@/app/lib/utils";

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
  const session = await verifySession();
  if (!session) return null;

  const transactions = await fetchFilteredTransactions(
    query,
    dates,
    currentPage,
    userId,
  );

  const userSettings = await fetchUserSettings(userId);
  const userLocale = userSettings[0]?.language || "en-US";

  const formattedTransactions = transactions.map((transaction) => ({
    ...transaction,
    amount: formatCurrency(Number(transaction.amount), false, userLocale),
  }));

  return (
    <div className="mt-2 flex-row ">
      <div className="min-w-full rounded-lg bg-gray-50 p-2 md:pt-0">
        {formattedTransactions?.map((transaction) => (
          <div
            key={transaction.id}
            className={`flex flex-row justify-between ${!transaction.isExpense ? "bg-primary-100" : "bg-white"}  m-1 rounded-lg`}
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
