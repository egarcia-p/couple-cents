import { deleteTransaction } from "@/app/lib/actions";
import Link from "next/link";

export function CreateTransaction() {
  return (
    <Link
      href="/dashboard/transactions/create"
      className="flex h-10 items-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
    >
      <span className="hidden md:block">Create Transaction</span>{" "}
      <span className="block md:hidden">+</span>{" "}
      {/* <PlusIcon className="h-5 md:ml-4" /> */}
    </Link>
  );
}

export function UpdateTransaction({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/transactions/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      Edit
      {/* <PencilIcon className="w-5" /> */}
    </Link>
  );
}

export function DeleteTransaction({ id }: { id: string }) {
  const deleteTransactionWithId = deleteTransaction.bind(null, id);
  return (
    <form action={deleteTransactionWithId}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        Delete
        <span className="sr-only">Delete</span>
        {/* <TrashIcon className="w-5" /> */}
      </button>
    </form>
  );
}
