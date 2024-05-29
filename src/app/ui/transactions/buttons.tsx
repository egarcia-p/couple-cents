import { deleteTransaction } from "@/app/lib/actions";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export function CreateTransaction({ isExpense }: { isExpense: boolean }) {
  return (
    <Link
      href={{
        pathname: "/dashboard/transactions/create",
        query: { isExpense: isExpense },
      }}
      className={`flex h-10 items-center rounded-lg ${!isExpense && "bg-primary-600"} ${isExpense && "bg-red-600"}  px-4 text-sm font-medium text-white transition-colors ${!isExpense && "hover:bg-primary-300"} ${isExpense && "hover:bg-red-300"} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2  ${!isExpense && "focus-visible:outline-primary-600"} ${isExpense && "focus-visible:outline-red-600"} `}
    >
      <span className="hidden md:block">
        Create
        {isExpense && " Expense"}
        {!isExpense && " Income"}
      </span>{" "}
      <PlusIcon className="h-5 md:ml-4 stroke-2" />
    </Link>
  );
}

export function UpdateTransaction({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/transactions/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteTransaction({ id }: { id: string }) {
  const deleteTransactionWithId = deleteTransaction.bind(null, id);
  return (
    <form action={deleteTransactionWithId}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}
