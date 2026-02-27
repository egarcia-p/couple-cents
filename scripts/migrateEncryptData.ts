/**
 * Data Migration Script: Encrypt Existing Plain-Text Data
 *
 * This script encrypts existing plain-text values in the database:
 * - transactions: amount, establishment
 * - user_budget_settings: budget
 * - user (Better Auth): name, email_hash
 *
 * It is idempotent — values that already look encrypted (iv:ciphertext:authTag format)
 * are skipped. Run this AFTER applying the schema migration (0006_brave_dragon_man.sql)
 * which changed the column types to text.
 *
 * Usage:
 *   npx tsx scripts/migrateEncryptData.ts
 *
 * Requires ENCRYPTION_KEY and POSTGRES_URL in .env.local
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import crypto from "crypto";
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

// ─── Validate env ────────────────────────────────────────────────────────────
if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL not found in .env.local");
}
if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY not found in .env.local");
}

// ─── Encryption helpers (duplicated from src/app/lib/crypto.ts to keep the   ─
// ─── script self-contained — scripts can't import from Next.js app easily)   ─
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const ENCODING: BufferEncoding = "base64";

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY!;
  const keyBuffer = Buffer.from(key, ENCODING);
  if (keyBuffer.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY must be exactly 32 bytes (256 bits) encoded in base64.",
    );
  }
  return keyBuffer;
}

function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString(ENCODING),
    encrypted.toString(ENCODING),
    authTag.toString(ENCODING),
  ].join(":");
}

function hashDeterministic(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.toLowerCase().trim())
    .digest("hex");
}

/**
 * Returns true if the value looks like it's already encrypted
 * (three base64-ish segments separated by colons).
 */
function looksEncrypted(value: string): boolean {
  const parts = value.split(":");
  if (parts.length !== 3) return false;
  // Each part should be valid base64 and non-empty
  const b64Regex = /^[A-Za-z0-9+/]+=*$/;
  return parts.every((p) => p.length > 0 && b64Regex.test(p));
}

// ─── Schema imports ──────────────────────────────────────────────────────────
import { transactions, userBudgetSettings, user } from "../drizzle/schema";

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  const db = drizzle(pool);

  console.log("=== Data Encryption Migration ===\n");

  // 1. Encrypt transactions (amount, establishment)
  console.log("[1/3] Migrating transactions...");
  const allTransactions = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      establishment: transactions.establishment,
    })
    .from(transactions);

  let txEncrypted = 0;
  let txSkipped = 0;

  for (const tx of allTransactions) {
    const needsAmountEncryption =
      tx.amount !== null && !looksEncrypted(tx.amount);
    const needsEstablishmentEncryption =
      tx.establishment !== null && !looksEncrypted(tx.establishment);

    if (!needsAmountEncryption && !needsEstablishmentEncryption) {
      txSkipped++;
      continue;
    }

    const updates: Record<string, string> = {};
    if (needsAmountEncryption) {
      updates.amount = encrypt(tx.amount);
    }
    if (needsEstablishmentEncryption) {
      updates.establishment = encrypt(tx.establishment);
    }

    await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, tx.id));
    txEncrypted++;
  }

  console.log(
    `   Transactions: ${txEncrypted} encrypted, ${txSkipped} already encrypted (${allTransactions.length} total)\n`,
  );

  // 2. Encrypt user_budget_settings (budget)
  console.log("[2/3] Migrating budget settings...");
  const allBudgets = await db
    .select({
      id: userBudgetSettings.id,
      userId: userBudgetSettings.userId,
      category: userBudgetSettings.category,
      budget: userBudgetSettings.budget,
    })
    .from(userBudgetSettings);

  let budgetEncrypted = 0;
  let budgetSkipped = 0;

  for (const b of allBudgets) {
    if (b.budget !== null && looksEncrypted(b.budget)) {
      budgetSkipped++;
      continue;
    }

    await db
      .update(userBudgetSettings)
      .set({ budget: encrypt(b.budget) })
      .where(eq(userBudgetSettings.id, b.id));
    budgetEncrypted++;
  }

  console.log(
    `   Budget settings: ${budgetEncrypted} encrypted, ${budgetSkipped} already encrypted (${allBudgets.length} total)\n`,
  );

  // 3. Encrypt user table (name) and populate email_hash
  console.log("[3/3] Migrating user records...");
  const allUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailHash: user.emailHash,
    })
    .from(user);

  let userEncrypted = 0;
  let userSkipped = 0;

  for (const u of allUsers) {
    const needsNameEncryption = u.name !== null && !looksEncrypted(u.name);
    const needsEmailHash = !u.emailHash && u.email;

    if (!needsNameEncryption && !needsEmailHash) {
      userSkipped++;
      continue;
    }

    const updates: Record<string, string> = {};
    if (needsNameEncryption) {
      updates.name = encrypt(u.name);
    }
    if (needsEmailHash) {
      updates.emailHash = hashDeterministic(u.email);
    }

    await db.update(user).set(updates).where(eq(user.id, u.id));
    userEncrypted++;
  }

  console.log(
    `   Users: ${userEncrypted} encrypted, ${userSkipped} already encrypted (${allUsers.length} total)\n`,
  );

  console.log("=== Migration complete ===");
  await pool.end();
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
