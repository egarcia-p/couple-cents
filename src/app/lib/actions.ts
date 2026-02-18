"use server";

import z from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import {
  transactions,
  userBudgetSettings,
  userSettings,
} from "../../../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { use } from "react";
import { set } from "zod";
import { cookies } from "next/headers";
import {
  getDateForUpdateTransaction,
  getTransactionDateWithTime,
} from "./utils";
import { fetchUserSettings } from "./data";
import { getTranslations } from "next-intl/server";

const booleanString = z
  .string()
  .refine((value) => value === "true" || value === "false", {
    message: "validation.boolean",
  })
  .transform((value) => value === "true");

const FormSchema = z.object({
  id: z.string(),
  isExpense: z.coerce.boolean(),
  amount: z.coerce.number().gt(0, { message: "validation.amount" }), // Use key instead
  note: z.string().optional(),
  establishment: z.string().min(1, { message: "validation.establishment" }),
  category: z.string({ invalid_type_error: "validation.category" }),
  isEssential: z.coerce.boolean(),
  userId: z.string(),
  transactionDate: z.string(),
});

const CreateTransaction = FormSchema.omit({
  id: true,
});

const UpdateTransaction = FormSchema.omit({ id: true });

const UserBudgetSettings = z.object({
  id: z.coerce.number(),
  userId: z.string(),
  category: z.string(),
  budget: z.coerce.number().gt(-1, {
    message: "validation.amount",
  }),
});
const UserBudgetSettingsCreate = UserBudgetSettings.omit({ id: true });

const UserSettings = z.object({
  id: z.coerce.number(),
  userId: z.string(),
  language: z.string(),
  timezone: z.string(),
});

const UserSettingsCreate = UserSettings.omit({ id: true });

export type State = {
  errors?: Partial<{
    isExpense: string[];
    amount: string[];
    note: string[];
    establishment: string[];
    category: string[];
    isEssential: string[];
    transactionDate: string[];
    language: string[];
    timezone: string[];
  }>;
  message?: string | null;
};

export async function createTransaction(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const translations = await getTranslations("TransactionsPage");

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
    const translatedErrors = Object.entries(
      validatedFields.error.flatten().fieldErrors,
    ).reduce(
      (acc, [key, errors]) => ({
        ...acc,
        [key]: errors?.map((e) => translations(e)), // Translate here
      }),
      {},
    );

    return {
      errors: translatedErrors,
      message: translations("create.missingFieldsError"),
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
    // Fetch user's timezone settings
    const userSettingsData = await fetchUserSettings(userId);
    const userTimezone = userSettingsData[0]?.timezone || "America/Mexico_City";
    const locale = userSettingsData[0]?.language;

    // Combine selected date with current time in user's timezone
    const timestamp = getTransactionDateWithTime(
      transactionDate,
      userTimezone,
      locale,
    );

    if (isNaN(timestamp.getTime())) {
      return {
        errors: { transactionDate: [translations("create.invalidDateError")] },
        message: translations("create.invalidDateMessage"),
      };
    }

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
      message: translations("create.databaseError"),
    };
  }

  revalidatePath("/dashboard/transactions");
  redirect("/dashboard/transactions");
}

export async function updateTransaction(
  id: string,
  prevState: State,
  formData: FormData,
): Promise<State> {
  const translations = await getTranslations("TransactionsPage");

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
    const translatedErrors = Object.entries(
      validatedFields.error.flatten().fieldErrors,
    ).reduce(
      (acc, [key, errors]) => ({
        ...acc,
        [key]: errors?.map((e) => translations(e)), // Translate here
      }),
      {},
    );
    return {
      errors: translatedErrors,
      message: translations("edit.missingFieldsError"),
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
    // Fetch user's timezone settings
    const userSettingsData = await fetchUserSettings(userId);
    const userTimezone = userSettingsData[0]?.timezone || "America/Mexico_City";
    const locale = userSettingsData[0]?.language;

    // Fetch existing transaction to check if date changed
    const existingTransaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    let finalTimestamp: Date;

    if (existingTransaction.length > 0) {
      const existingDate = new Date(existingTransaction[0].transactionDate);

      finalTimestamp = getDateForUpdateTransaction(
        existingDate,
        transactionDate,
        userTimezone,
        locale,
      );

      if (isNaN(finalTimestamp.getTime())) {
        return {
          errors: {
            transactionDate: [translations("edit.invalidDateError")],
          },
          message: translations("edit.invalidDateMessage"),
        };
      }
    } else {
      // Fallback: Error
      return {
        message: translations("edit.databaseError"),
      };
    }

    const setValues = {
      isExpense: isExpense,
      amount: amountInCents.toString(),
      note: note,
      establishment: establishment,
      category: category,
      isEssential: isEssential,
      userId: userId,
      transactionDate: finalTimestamp,
    };

    await db.update(transactions).set(setValues).where(eq(transactions.id, id));
  } catch (error) {
    return { message: translations("edit.databaseError") };
  }

  revalidatePath("/dashboard/transactions");
  redirect("/dashboard/transactions");
}

export async function deleteTransaction(id: string) {
  const translations = await getTranslations("TransactionsPage");
  try {
    await db.delete(transactions).where(eq(transactions.id, id));

    revalidatePath("/dashboard/transactions");
    return { message: translations("delete.success") };
  } catch (error) {
    return { message: translations("delete.databaseError") };
  }
}

export async function saveBudgetSettings(prevState: State, formData: FormData) {
  const translations = await getTranslations("Profile");
  try {
    // create or save budget settings
    const userId = formData.get("userId") as string;
    // Get all entries and filter for budget settings
    const budgetSettings = Array.from(formData.entries())
      .filter(([key]) => key.startsWith("budget-"))
      .map(([key, value]) => ({
        userId,
        category: key.replace("budget-", ""),
        budget: value,
      }));

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
      userId: userId,
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
        // If it exists, update the budget
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
      message: translations("budget.databaseError"),
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function saveLanguageSettings(
  prevState: State,
  formData: FormData,
) {
  const translations = await getTranslations("Profile");
  try {
    // Save both locale and timezone settings to userSettings table
    const userId = formData.get("userId") as string;
    const locale = formData.get("locale") as string;
    const timezone = formData.get("timezone") as string;

    if (!userId || !locale || !timezone) {
      return {
        message: translations("missingRequiredFields"),
      };
    }

    // Save to userSettings table
    const setting = {
      userId: userId,
      language: locale,
      timezone: timezone,
    };

    const parsedSettings = UserSettingsCreate.safeParse(setting);

    if (!parsedSettings.success) {
      return {
        errors: parsedSettings.error.flatten().fieldErrors,
        message: translations("missingRequiredFields"),
      };
    }

    // Check if the setting already exists
    const existingSetting = await db
      .select()
      .from(userSettings)
      .where(and(eq(userSettings.userId, userId)))
      .limit(1)
      .execute();

    if (existingSetting.length === 0) {
      type NewUserSetting = typeof userSettings.$inferInsert;
      const newUserSetting: NewUserSetting = parsedSettings.data;
      await db.insert(userSettings).values(newUserSetting);
    } else {
      // If it exists, update
      const setValues = {
        language: parsedSettings.data.language.toString(),
        timezone: parsedSettings.data.timezone.toString(),
      };
      await db
        .update(userSettings)
        .set(setValues)
        .where(and(eq(userSettings.userId, userId)));
    }

    // Set the cookie for immediate use
    (await cookies()).set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  } catch (error) {
    return {
      message: translations("saveSettings.databaseError"),
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
