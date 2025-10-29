import { fetchFilteredTransactions } from "@/app/lib/data";
import { DeleteTransaction, UpdateTransaction } from "./buttons";
import { formatDateToLocal } from "@/app/lib/utils";
import DownloadCSV from "./download-button";
import { verifySession } from "@/app/lib/dal";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

export default async function DashboardTable({
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

  const t = await getTranslations("DashboardTable");

  const transactions = await fetchFilteredTransactions(
    query,
    dates,
    currentPage,
    userId,
  );

  const locale: string = cookies().get("NEXT_LOCALE")?.value || "en-GB";

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-3 py-5 font-medium">
                  {t("establishment")}
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  {t("category")}
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  {t("amount")}
                </th>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  {t("note")}
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  {t("transactionDate")}
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {transactions?.map((transaction) => (
                <tr
                  key={transaction.id}
                  className={` ${!transaction.isExpense && "bg-primary-100"} w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg`}
                >
                  <td className="whitespace-nowrap px-3 py-3">
                    {transaction.establishment}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {transaction.category}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {transaction.amount}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{transaction.note}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(
                      transaction.transactionDate.toUTCString(),
                      locale,
                    )}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateTransaction id={transaction.id} />
                      <DeleteTransaction id={transaction.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <DownloadCSV
        userId={userId}
        fileName="transactions_"
        dates={dates}
        query={query}
      />
    </div>
  );
}
