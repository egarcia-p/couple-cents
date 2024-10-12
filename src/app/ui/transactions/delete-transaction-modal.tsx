"use client";

import React from "react";
import IconButton from "./Button/icon-button";
import ConfirmDialog from "./confirm-dialog";
import { TrashIcon } from "@heroicons/react/24/outline";

interface Props {
  onConfirm: Function;
}

export default function DeleteTransactionModal(props: Props) {
  const { onConfirm } = props;
  const [confirmOpen, setConfirmOpen] = React.useState(false);

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
        title="Delete Transaction?"
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => onConfirm()}
      >
        Are you sure you want to delete this transaction?
      </ConfirmDialog>
    </div>
  );
}
