import {
  user,
  userSettings,
  userBudgetSettings,
  transactions,
} from "../drizzle/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import { Pool } from "pg";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: "./.env.local" });

if (!("POSTGRES_URL" in process.env))
  throw new Error("POSTGRES_URL not found on .env.local");

const DEMO_EMAIL = "demo@couple-cents.com";
const DEMO_PASSWORD = "DemoPassword123!";
const DEMO_NAME = "Demo User";
const DEMO_TIMEZONE = "America/Chicago";
const DEMO_LANGUAGE = "en-US";

interface DemoUser {
  id: string;
}

// Budget categories using the keys from categories.json
const budgetCategories: Record<string, number> = {
  HOU: 2000, // Housing
  GRO: 600, // Groceries
  TRA: 400, // Transportation
  UTI: 200, // Utilities
  ENT: 300, // Entertainment
  HEA: 250, // Healthcare
  DIN: 350, // Dining Out
  SHO: 150, // Shopping
};

const categoryEstablishments: Record<string, string[]> = {
  HOU: ["Landlord Payment", "Mortgage", "Property Management"],
  GRO: ["Whole Foods", "Trader Joe's", "Kroger", "Safeway", "Costco"],
  TRA: ["Shell Gas", "Chevron", "Uber", "Lyft", "Public Transit"],
  UTI: [
    "Electric Company",
    "Water Utility",
    "Gas Company",
    "Internet Provider",
  ],
  ENT: ["Netflix", "Spotify", "Movie Theater", "Concert Venue", "Gaming"],
  HEA: ["CVS Pharmacy", "Walgreens", "Doctor's Office", "Dental Clinic"],
  DIN: [
    "Chipotle",
    "Starbucks",
    "Local Restaurant",
    "Pizza Place",
    "Sushi Bar",
  ],
  SHO: ["Target", "Walmart", "Amazon", "Mall", "Clothing Store"],
};

const expenseCategories = Object.keys(budgetCategories);
const essentialCategories = ["HOU", "GRO", "UTI", "HEA"];

const main = async () => {
  const client = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });
  const db = drizzle(client);

  try {
    console.log("🌱 Starting demo data seed...\n");

    // Step 1: Check if demo user exists or create
    const demoUser = await seedDemoUser(db);
    console.log(`✅ Demo user ready: ${demoUser.id}`);

    // Step 2: Seed user settings
    await seedUserSettings(db, demoUser.id);
    console.log(`✅ User settings configured`);

    // Step 3: Seed budget settings
    await seedBudgetSettings(db, demoUser.id);
    console.log(
      `✅ Monthly budgets created (${Object.keys(budgetCategories).length} categories)`,
    );

    // Step 4: Seed transactions
    await seedTransactions(db, demoUser.id);
    console.log(`✅ Transactions seeded (12 months of data)`);

    console.log("\n🎉 Demo data seeding complete!");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  } finally {
    await client.end();
  }
};

async function seedDemoUser(db: ReturnType<typeof drizzle>): Promise<DemoUser> {
  // Check if demo user already exists
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, DEMO_EMAIL));

  if (existingUser.length > 0) {
    console.log(`ℹ️  Demo user already exists, reusing...`);
    return { id: existingUser[0].id };
  }

  // Create demo user
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  const newUser = await db
    .insert(user)
    .values({
      id: crypto.randomUUID(),
      name: DEMO_NAME,
      email: DEMO_EMAIL,
      emailVerified: true,
      image: null,
    })
    .returning();

  // Create corresponding account entry for password auth
  const newAccount = await db
    .insert(require("../drizzle/schema").account as any)
    .values({
      id: crypto.randomUUID(),
      accountId: newUser[0].id,
      providerId: "credential",
      userId: newUser[0].id,
      password: hashedPassword,
    })
    .returning();

  console.log(`ℹ️  Created new demo user with email: ${DEMO_EMAIL}`);
  return { id: newUser[0].id };
}

async function seedUserSettings(
  db: ReturnType<typeof drizzle>,
  userId: string,
): Promise<void> {
  // Check if settings already exist
  const existingSettings = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

  if (existingSettings.length > 0) {
    console.log(`ℹ️  User settings already exist, skipping...`);
    return;
  }

  await db.insert(userSettings).values({
    userId,
    language: DEMO_LANGUAGE,
    timezone: DEMO_TIMEZONE,
  });
}

async function seedBudgetSettings(
  db: ReturnType<typeof drizzle>,
  userId: string,
): Promise<void> {
  // Check if budgets already exist
  const existingBudgets = await db
    .select()
    .from(userBudgetSettings)
    .where(eq(userBudgetSettings.userId, userId));

  if (existingBudgets.length > 0) {
    console.log(`ℹ️  Budget settings already exist, skipping...`);
    return;
  }

  const budgetData = Object.entries(budgetCategories).map(
    ([category, amount]) => ({
      userId,
      category,
      budget: amount.toString(),
    }),
  );

  await db.insert(userBudgetSettings).values(budgetData);
}

async function seedTransactions(
  db: ReturnType<typeof drizzle>,
  userId: string,
): Promise<void> {
  // Check if transactions already exist for this user
  const existingTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId));

  if (existingTransactions.length > 0) {
    console.log(`ℹ️  Transactions already exist for user, skipping...`);
    return;
  }

  const transactionData: (typeof transactions.$inferInsert)[] = [];

  // Generate transactions for 2025 and all of 2026
  const endDate = new Date(2026, 11, 31); // Dec 31, 2026
  const startDate = new Date(2025, 0, 1); // Jan 1, 2025

  // Track monthly spending per category for realism
  const currentDate = new Date(startDate);
  const monthlySpending: Record<string, Record<string, number>> = {};

  while (currentDate <= endDate) {
    const month = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, "0")}`;

    // Initialize month tracking if needed
    if (!monthlySpending[month]) {
      monthlySpending[month] = {};
      for (const cat of expenseCategories) {
        monthlySpending[month][cat] = 0;
      }
    }

    // Generate 2-4 transactions per day on average
    const transactionsPerDay =
      Math.floor(Math.random() * 4) + (Math.random() > 0.7 ? 1 : 0);

    for (let i = 0; i < transactionsPerDay; i++) {
      const category =
        expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      const isEssential = essentialCategories.includes(category);
      const isExpense = Math.random() > 0.05; // 95% expenses, 5% income

      let amount: number;
      if (isExpense) {
        const budgetAmount =
          budgetCategories[category as keyof typeof budgetCategories];
        const currentMonthSpending = monthlySpending[month][category];

        // Calculate variance based on budget
        let variance: number;
        if (currentMonthSpending < budgetAmount * 0.5) {
          // Under budget - more likely to spend
          variance = Math.random() * (budgetAmount * 0.08); // 0-8% of budget per transaction
        } else if (currentMonthSpending < budgetAmount) {
          // Near budget - smaller amounts
          variance = Math.random() * (budgetAmount * 0.05); // 0-5% of budget per transaction
        } else {
          // Over budget - rare, smaller amounts
          variance =
            Math.random() > 0.7 ? Math.random() * (budgetAmount * 0.03) : 0;
        }

        amount = variance;
        monthlySpending[month][category] += amount;
      } else {
        // Income: monthly salary around $4000
        // Add only 2-3 times per month
        if (
          transactionData.filter(
            (t) =>
              !t.isExpense &&
              new Date(t.transactionDate!).getMonth() ===
                currentDate.getMonth(),
          ).length < 2
        ) {
          amount = 1900 + Math.random() * 200; // Salary variation
        } else {
          continue; // Skip this income transaction
        }
      }

      if (amount <= 0 && isExpense) continue; // Skip zero/negative expenses

      // Add random time of day (0:00 - 23:59)
      const hours = Math.floor(Math.random() * 24);
      const minutes = Math.floor(Math.random() * 60);
      const transactionDateTime = new Date(currentDate);
      transactionDateTime.setHours(hours, minutes, 0, 0);

      const establishments = categoryEstablishments[category] || [
        faker.company.name(),
      ];
      const establishment =
        establishments[Math.floor(Math.random() * establishments.length)];

      transactionData.push({
        isExpense,
        amount: Math.round(amount * 100).toString(), // Store as cents (e.g., $123.45 = 12345)
        establishment: isExpense ? establishment : `Salary - ${establishment}`,
        category: isExpense ? category : "INC", // Use category code or INC for income
        isEssential,
        userId,
        transactionDate: transactionDateTime,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (transactionData.length > 0) {
    // Insert in batches of 100 to avoid memory issues
    for (let i = 0; i < transactionData.length; i += 100) {
      const batch = transactionData.slice(i, i + 100);
      await db.insert(transactions).values(batch);
    }
    console.log(`ℹ️  Created ${transactionData.length} transactions`);
  }
}

main();
