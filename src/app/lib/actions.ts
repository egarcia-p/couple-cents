"use server";

import z from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import { transactions } from "../../../drizzle/schema";
import { use } from "react";

const FormSchema = z.object({
  id: z.string(),
  isExpense: z.coerce.boolean(),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  note: z.string().optional(),
  establishment: z.string(),
  category: z.string(),
  isEssential: z.coerce.boolean(),
  userId: z.coerce.number(),
  transactionDate: z.string(),
});

const CreateTransaction = FormSchema.omit({
  id: true,
});

export type State = {
  errors?: {
    isExpense?: string[];
    amount?: string[];
    note?: string[];
    establishment?: string[];
    category?: string[];
    isEssential?: string[];
    transactionDate?: string[];
  };
  message?: string | null;
};

export async function createTransaction(prevState: State, formData: FormData) {
  const validatedFields = CreateTransaction.safeParse({
    isExpense: formData.get("isExpense"),
    amount: formData.get("amount"),
    note: formData.get("note"),
    establishment: formData.get("establishment"),
    category: formData.get("category"),
    isEssential: formData.get("isEssential"),
    userId: formData.get("userId"),
    transactionDate: formData.get("transactionDate"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Transaction.",
    };
  }

  const {
    isExpense,
    amount,
    note,
    establishment,
    category,
    isEssential,
    userId,
    transactionDate,
  } = validatedFields.data;

  const amountInCents = amount * 100;
  //const transactionDate = new Date().toISOString().split("T")[0];

  try {
    const timestamp = new Date(transactionDate);

    type NewTransaction = typeof transactions.$inferInsert;
    const newTransaction: NewTransaction = {
      isExpense,
      amount: amountInCents.toString(),
      note,
      establishment,
      category,
      isEssential,
      userId,
      transactionDate: timestamp,
    };

    await db.insert(transactions).values(newTransaction);
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Transaction.",
    };
  }

  revalidatePath("/dashboard/transactions");
  redirect("/dashboard/transactions");
}
