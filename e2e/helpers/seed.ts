import { Pool } from "pg";
import { encrypt } from "../../src/app/lib/crypto";

export async function createTransaction(
  pool: Pool,
  userId: string,
  data: {
    amount: string;
    establishment: string;
    category: string;
    isExpense: boolean;
    isEssential: boolean;
    date?: Date;
    encryptFields?: boolean;
  },
) {
  const {
    amount,
    establishment,
    category,
    isExpense,
    isEssential,
    date = new Date(),
    encryptFields = true,
  } = data;

  const finalAmount = encryptFields ? encrypt(amount) : amount;
  const finalEstablishment = encryptFields
    ? encrypt(establishment)
    : establishment;

  const res = await pool.query(
    `INSERT INTO "transactions" (id, "isExpense", amount, establishment, category, "isEssential", "userId", "transactionDate") 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
     RETURNING id`,
    [
      crypto.randomUUID(),
      isExpense,
      finalAmount,
      finalEstablishment,
      category,
      isEssential,
      userId,
      date,
    ],
  );
  return res.rows[0].id;
}

export async function setBudget(
  pool: Pool,
  userId: string,
  category: string,
  amount: string,
  encryptField: boolean = true,
) {
  const finalBudget = encryptField ? encrypt(amount) : amount;

  await pool.query(
    `INSERT INTO "user_budget_settings" ("userId", category, budget) 
     VALUES ($1, $2, $3) 
     ON CONFLICT DO UPDATE SET budget = EXCLUDED.budget`,
    [userId, category, finalBudget],
  );
}
