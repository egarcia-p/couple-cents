import { fetchFilteredTransactions } from "@/app/lib/data";
import { auth } from "../../../auth";
import { DeleteTransaction, UpdateTransaction } from "./buttons";

export default async function DashboardTable({
  query,
  currentPage,
  userId,
}: {
  query: string;
  currentPage: number;
  userId: string;
}) {
  const session = await auth();

  if (!session) return null;

  if (!session.user) return null;

  const transactions = await fetchFilteredTransactions(
    query,
    currentPage,
    userId,
  );

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Note
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Establishment
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Category
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Transaction Date
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
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{transaction.note}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {transaction.establishment}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {transaction.amount}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {transaction.category}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {/* {formatDateToLocal(transaction.transactionDate.timestamp())} */}
                    {transaction.transactionDate.toDateString()}
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
    </div>
  );
}
