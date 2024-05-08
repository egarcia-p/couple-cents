import { transactions, users } from "./../drizzle/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

if (!("POSTGRES_URL" in process.env))
  throw new Error("POSTGRES_URL not found on .env.local");

const main = async () => {
  const client = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });
  const db = drizzle(client);
  const data: (typeof transactions.$inferInsert)[] = [];

  const result = await db.select().from(users).where(eq(users.id, 1));
  console.log(result);

  for (let i = 0; i < 20; i++) {
    data.push({
      isExpense: true,
      amount: faker.commerce.price(),
      establishment: faker.commerce.productName(),
      category: faker.word.noun(),
      isEssential: faker.datatype.boolean(),
      userId: result[0].id,
      transactionDate: faker.date.recent(),
    });
  }

  console.log("Seed start");
  await db.insert(transactions).values(data);
  console.log("Seed done");
};

main();
