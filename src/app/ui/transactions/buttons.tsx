import { deleteTransaction } from "@/app/lib/actions";
import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  DocumentCurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import IconButton from "./Button/icon-button";
import ConfirmDialog from "./confirm-dialog";
import DeleteTransactionModal from "./delete-transaction-modal";
import { useTranslations } from "next-intl";

export function CreateTransaction({ isExpense }: { isExpense: boolean }) {
  const t = useTranslations("TransactionsPage");
  const tButtons = useTranslations("Buttons");
  return (
    <Link
      href={{
        pathname: "/dashboard/transactions/create",
        query: { isExpense: isExpense },
      }}
      className={`flex h-10 items-center rounded-lg ${!isExpense && "bg-primary-600"} ${isExpense && "bg-red-600"}  px-4 text-sm font-medium text-white transition-colors ${!isExpense && "hover:bg-primary-300"} ${isExpense && "hover:bg-red-300"} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2  ${!isExpense && "focus-visible:outline-primary-600"} ${isExpense && "focus-visible:outline-red-600"} `}
    >
      <span className="hidden md:block">
        {tButtons("create")}
        {isExpense && ` ${t("expenseButton")}`}
        {!isExpense && ` ${t("incomeButton")}`}
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

export function DeleteTransaction({
  id,
  isExpense,
}: {
  id: string;
  isExpense: boolean;
}) {
  const deleteTransactionWithId = deleteTransaction.bind(null, id);

  return (
    <>
      <DeleteTransactionModal
        onConfirm={deleteTransactionWithId}
        isExpense={isExpense}
      />
    </>
  );
}

interface DownloadCSVButtonProps {
  clickHandler: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function DownloadCSVButton({ clickHandler }: DownloadCSVButtonProps) {
  const tButtons = useTranslations("Buttons");
  return (
    <button
      onClick={clickHandler}
      className="flex h-10 items-center rounded-md border m-2 p-2 bg-primary-600 hover:bg-primary-300 px-4 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <span className="">{tButtons("downloadCsv")}</span>
      <DocumentCurrencyDollarIcon className="w-5" />
    </button>
  );
}
