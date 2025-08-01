import { drizzle } from "drizzle-orm/vercel-postgres";
import { relations } from "drizzle-orm";
import { sql } from "@vercel/postgres";
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  uniqueIndex,
  integer,
  bigint,
  primaryKey,
  uuid,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }),
    emailVerified: timestamp("emailVerified", {
      withTimezone: true,
    }),
    familyId: integer("familyId"),

    image: text("image"),
  },
  (users) => {
    return {
      uniqueIdx: uniqueIndex("unique_idx").on(users.email),
    };
  },
);

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: bigint("expires_at", { mode: "bigint" }),
  id_token: text("id_token"),
  scope: text("scope"),
  session_state: text("session_state"),
  token_type: text("token_type"),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  expires: timestamp("expires", {
    withTimezone: true,
  }).notNull(),
  sessionToken: varchar("sessionToken", { length: 255 }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    expires: timestamp("expires", {
      withTimezone: true,
    }).notNull(),
    token: text("token").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.identifier, table.token] }),
    };
  },
);

export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("createdAt", {
    withTimezone: true,
  }),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  isExpense: boolean("isExpense").notNull(),
  amount: numeric("amount").notNull(),
  note: text("note"),
  establishment: varchar("establishment", { length: 255 }).notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  isEssential: boolean("isEssential").notNull(),
  userId: integer("userId").notNull(),
  transactionDate: timestamp("transactionDate", {
    withTimezone: true,
  }).notNull(),
});

export const userBudgetSettings = pgTable("user_budget_settings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  budget: numeric("budget").notNull(),
});

// ...

// export const faimilyRelations = relations(families, ({ many }) => ({
//   users: many(users),
// }));

// export const userRelations = relations(users, ({ many }) => ({
//   transactions: many(transactions),
// }));
