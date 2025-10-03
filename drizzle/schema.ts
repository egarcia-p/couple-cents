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
  userId: text("userId").notNull(),
  transactionDate: timestamp("transactionDate", {
    withTimezone: true,
  }).notNull(),
});

export const userBudgetSettings = pgTable("user_budget_settings", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  budget: numeric("budget").notNull(),
});

//  Better Auth Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// ...

// export const faimilyRelations = relations(families, ({ many }) => ({
//   users: many(users),
// }));

// export const userRelations = relations(users, ({ many }) => ({
//   transactions: many(transactions),
// }));
