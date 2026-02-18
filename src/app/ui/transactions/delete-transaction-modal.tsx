"use client";

import React from "react";
import IconButton from "./Button/icon-button";
import ConfirmDialog from "./confirm-dialog";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

interface Props {
  onConfirm: Function;
  isExpense: boolean;
}

export default function DeleteTransactionModal(props: Props) {
  const { onConfirm, isExpense } = props;
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const t = useTranslations("TransactionsPage");

  return (
    <div>
      <IconButton
        className="rounded-md border p-2 hover:bg-gray-100"
        aria-label="delete"
        onClick={() => setConfirmOpen(true)}
      >
        <TrashIcon className="w-5" />
      </IconButton>
      <ConfirmDialog
        title={isExpense ? t("delete.deleteExpense") : t("delete.deleteIncome")}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => onConfirm()}
      >
        {t("delete.confirmationMessage")}
      </ConfirmDialog>
    </div>
  );
}
