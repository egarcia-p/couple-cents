import { fetchFilteredTransactions, fetchUserSettings } from "@/app/lib/data";
import { DeleteTransaction, UpdateTransaction } from "./buttons";
import { verifySession } from "@/app/lib/dal";
import { formatCurrency } from "@/app/lib/utils";
import { TagBadge } from "./tag-badge";

export default async function DashboardTableMobile({
  query,
  dates,
  currentPage,
  userId,
  tagIds,
}: {
  query: string;
  dates: string;
  currentPage: number;
  userId: string;
  tagIds?: string[];
}) {
  const session = await verifySession();
  if (!session) return null;

  const transactions = await fetchFilteredTransactions(
    query,
    dates,
    currentPage,
    userId,
    tagIds,
  );

  const userSettings = await fetchUserSettings(userId);
  const userLocale = userSettings[0]?.language || "en-US";

  const formattedTransactions = transactions.map((transaction) => ({
    ...transaction,
    amount: formatCurrency(Number(transaction.amount), false, userLocale),
  }));

  return (
    <div className="mt-2 flex-row ">
      <div className="min-w-full rounded-lg bg-gray-50 dark:bg-gray-800 p-2 md:pt-0">
        {formattedTransactions?.map((transaction) => (
          <div
            key={transaction.id}
            className={`flex flex-row justify-between ${!transaction.isExpense ? "bg-primary-100 dark:bg-primary-600/20" : "bg-white dark:bg-gray-900"}  m-1 rounded-lg`}
          >
            <div className="py-3 pl-6 pr-3 inline-block w-1/2 my-auto">
              <p className="line-clamp-1 ">{transaction.establishment}</p>
              {transaction.tags && transaction.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {transaction.tags.map((tag) => (
                    <TagBadge key={tag.id} name={tag.name} color={tag.color} />
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-row gap-2 py-3 pl-6 pr-3 font-bold my-auto">
              <div className="my-auto">
                <span>{transaction.amount}</span>
              </div>
              <div className="flex justify-end gap-2">
                <UpdateTransaction id={transaction.id} />
                <DeleteTransaction
                  id={transaction.id}
                  isExpense={transaction.isExpense}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
