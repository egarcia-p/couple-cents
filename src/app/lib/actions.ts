"use server";

import z from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import { transactions, userBudgetSettings } from "../../../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { use } from "react";
import { set } from "zod";

const booleanString = z
  .string()
  .refine((value) => value === "true" || value === "false", {
    message: "Value must be a boolean",
  })
  .transform((value) => value === "true");

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

const UpdateTransaction = FormSchema.omit({ id: true });

const UserBudgetSettings = z.object({
  id: z.coerce.number(),
  userId: z.coerce.number(),
  category: z.string(),
  budget: z.coerce.number().gt(-1, {
    message: "Please enter a budget that is greater or equal to $0",
  }),
});
const UserBudgetSettingsUpdate = UserBudgetSettings.extend({
  id: z.coerce.number().optional(),
  userId: z.coerce.number().optional(),
  category: z.string().optional(),
  budget: z.coerce.number().gt(-1, {
    message: "Please enter a budget that is greater or equal to $0",
  }),
});
const UserBudgetSettingsCreate = UserBudgetSettings.omit({ id: true });

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
    isExpense: booleanString.parse(formData.get("isExpense")),
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

  let amountInCents = amount * 100;
  amountInCents = Math.round(amountInCents);

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

export async function updateTransaction(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateTransaction.safeParse({
    isExpense: booleanString.parse(formData.get("isExpense")),
    amount: formData.get("amount"),
    note: formData.get("note"),
    establishment: formData.get("establishment"),
    category: formData.get("category"),
    isEssential: formData.get("isEssential"),
    userId: formData.get("userId"),
    transactionDate: formData.get("transactionDate"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Transaction.",
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

  let amountInCents = amount * 100;
  amountInCents = Math.round(amountInCents);

  try {
    const timestampTransactionDate = new Date(transactionDate);

    const setValues = {
      isExpense: isExpense,
      amount: amountInCents.toString(),
      note: note,
      establishment: establishment,
      category: category,
      isEssential: isEssential,
      userId: userId,
      transactionDate: timestampTransactionDate,
    };

    await db.update(transactions).set(setValues).where(eq(transactions.id, id));
  } catch (error) {
    return { message: "Database Error: Failed to Update Transaction." };
  }

  revalidatePath("/dashboard/transactions");
  redirect("/dashboard/transactions");
}

export async function deleteTransaction(id: string) {
  try {
    await db.delete(transactions).where(eq(transactions.id, id));

    revalidatePath("/dashboard/transactions");
    return { message: "Deleted Transaction." };
  } catch (error) {
    return { message: "Database Error: Failed to Delete Transaction." };
  }
}

export async function saveBudgetSettings(prevState: State, formData: FormData) {
  try {
    console.log("Form Data: ", formData);
    // create or save budget settings
    const userId = Number(formData.get("userId"));
    // Get all entries and filter for budget settings
    const budgetSettings = Array.from(formData.entries())
      .filter(([key]) => key.startsWith("budget-"))
      .map(([key, value]) => ({
        userId,
        category: key.replace("budget-", ""),
        budget: value,
      }));

    console.log("User ID: ", userId);
    console.log("Budget Settings: ", budgetSettings);

    const parsedBudgetSettings = budgetSettings.map((setting) => {
      const parsedSetting = UserBudgetSettingsCreate.safeParse(setting);
      if (!parsedSetting.success) {
        throw new Error(
          `Invalid budget setting: ${setting}. Error: ${parsedSetting.error}`,
        );
      }
      return parsedSetting.data;
    });
    const budgetSettingsToSave = parsedBudgetSettings.map((setting) => ({
      userId: Number(userId),
      category: setting.category,
      budget: Number(setting.budget).toString(),
    }));

    for (const setting of budgetSettingsToSave) {
      // Check if the setting already exists
      const existingSetting = await db
        .select()
        .from(userBudgetSettings)
        .where(
          and(
            eq(userBudgetSettings.userId, userId),
            eq(userBudgetSettings.category, setting.category),
          ),
        )
        .limit(1)
        .execute();
      if (existingSetting.length === 0) {
        await db.insert(userBudgetSettings).values(setting);
      } else {
        // If it exists, update the budge
        const setValues = {
          budget: setting.budget.toString(),
        };
        await db
          .update(userBudgetSettings)
          .set(setValues)
          .where(
            and(
              eq(userBudgetSettings.userId, userId),
              eq(userBudgetSettings.category, setting.category),
            ),
          );
      }
    }
  } catch (error) {
    return {
      message: "Database Error: Failed to Save Budget Settings.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
