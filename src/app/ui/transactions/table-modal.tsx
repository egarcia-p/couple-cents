"use client";

import React from "react";
import IconButton from "./Button/icon-button";
import ConfirmDialog from "./confirm-dialog";

export default function TableModal() {
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <div>
      <IconButton aria-label="delete" onClick={() => setConfirmOpen(true)}>
        Delete{" "}
      </IconButton>
      <ConfirmDialog
        title="Delete Post?"
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => console.log("DELETING")}
      >
        Are you sure you want to delete this post?
      </ConfirmDialog>
    </div>
  );
}
