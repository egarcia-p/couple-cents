"use client";

import { updateTransaction } from "@/app/lib/actions";
import { useFormState } from "react-dom";
import { Button } from "../button";
import Link from "next/link";
import { TransactionForm } from "@/app/lib/definitions";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs, { Dayjs } from "dayjs";

export default function Form({
  transaction,
  categories,
}: {
  transaction: TransactionForm;
  categories: Object;
}) {
  const initialState = { message: "", errors: {} };
  const updateTransactionWithId = updateTransaction.bind(null, transaction.id);
  const [state, dispatch] = useFormState(updateTransactionWithId, initialState);

  //Date state
  const date = new Date(transaction.transactionDate);
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let dt = date.getDate();
  let monthString = date.getMonth() + 1 + "";
  let dayString = date.getDate() + "";

  if (dt < 10) {
    dayString = "0" + dt;
  }
  if (month < 10) {
    monthString = "0" + month;
  }

  const dateFormatted = year + "-" + monthString + "-" + dayString;
  const [startDate, setStartDate] = useState<Dayjs>(dayjs(dateFormatted));

  const userId = transaction.userId;

  return (
    <>
      <div id="message-error" aria-live="polite" aria-atomic="true">
        {state.message && (
          <p className="mt-2 text-sm text-red-500" key={state.message}>
            {state.message}
          </p>
        )}
      </div>
      <form action={dispatch}>
        <div className="rounded-md bg-gray-50 p-4 md:p-6 text-black">
          {/* Transaction isExpense */}
          <div className="mb-4">
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="isExpense"
                  name="isExpense"
                  type="hidden"
                  value={transaction.isExpense.toString()}
                  aria-describedby="isExpense-error"
                />
              </div>
            </div>
          </div>

          {/* Transaction Amount */}
          <div className="mb-4">
            <label htmlFor="amount" className="mb-2 block text-sm font-medium">
              Choose an amount
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={transaction.amount}
                  placeholder="Enter MXN amount"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  aria-describedby="amount-error"
                />
                {/* <  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
              </div>
              <div id="amount-error" aria-live="polite" aria-atomic="true">
                {state.errors?.amount &&
                  state.errors.amount.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>

          {/* Establishment Name */}
          <div className="mb-4">
            <label
              htmlFor="establishment"
              className="mb-2 block text-sm font-medium"
            >
              Choose establishment
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="establishment"
                  name="establishment"
                  type="text"
                  placeholder="Enter a establishment"
                  defaultValue={transaction.establishment}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  aria-describedby="establishment-error"
                />
                {/* <  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
              </div>
              <div
                id="establishment-error"
                aria-live="polite"
                aria-atomic="true"
              >
                {state.errors?.establishment &&
                  state.errors.establishment.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>

          {/* Category Name */}
          <div className="mb-4">
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium"
            >
              Choose category
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  aria-describedby="category-error"
                  defaultValue={transaction.category}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {Object.entries(categories).map(
                    ([key, value]: [string, string]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div id="category-error" aria-live="polite" aria-atomic="true">
                {state.errors?.category &&
                  state.errors.category.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>

          {/* Transaction Note  */}
          <div className="mb-4">
            <label htmlFor="note" className="mb-2 block text-sm font-medium">
              Add a note
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="note"
                  name="note"
                  type="text"
                  placeholder="Enter a note"
                  defaultValue={transaction.note}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  aria-describedby="note-error"
                />
                {/* <  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
              </div>
              <div id="note-error" aria-live="polite" aria-atomic="true">
                {state.errors?.note &&
                  state.errors.note.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>

          {/* Transaction isEssential */}
          {transaction.isExpense && (
            <div className="mb-4">
              <label
                htmlFor="isEssential"
                className="mb-2 block text-sm font-medium"
              >
                Choose if is an essential expense
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <input
                    id="isEssential"
                    name="isEssential"
                    type="checkbox"
                    defaultChecked={transaction.isEssential}
                    aria-describedby="isEssential-error"
                  />
                  {/* <  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
                </div>
                <div
                  id="isEssential-error"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {state.errors?.isEssential &&
                    state.errors.isEssential.map((error: string) => (
                      <p className="mt-2 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* userId Name */}
          <div className="mb-4">
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input id="userId" name="userId" type="hidden" value={userId} />
                {/* <  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
              </div>
            </div>
          </div>

          {/* Transaction Date */}
          <div className="mb-4">
            <label
              htmlFor="transactionDate"
              className="mb-2 block text-sm font-medium"
            >
              Choose a Date of Transaction
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                {/* <DatePicker
                  id="transactionDate"
                  name="transactionDate"
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                /> */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Date"
                    name="transactionDate"
                    value={startDate ? startDate : dayjs("2022-04-17")}
                    onChange={(date) =>
                      setStartDate(date ? date : dayjs("2022-04-17"))
                    }
                  />
                </LocalizationProvider>
                {/* <  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
              </div>
              <div
                id="transactionDate-error"
                aria-live="polite"
                aria-atomic="true"
              >
                {state.errors?.transactionDate &&
                  state.errors.transactionDate.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/dashboard/transactions"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancel
          </Link>
          <Button type="submit">Update Transaction</Button>
        </div>
      </form>
    </>
  );
}
