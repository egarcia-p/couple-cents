import { drizzle } from "drizzle-orm/vercel-postgres";
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
} from "drizzle-orm/pg-core";

export const UsersTable = pgTable(
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

export const AccountsTable = pgTable("accounts", {
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

export const SessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  expires: timestamp("expires", {
    withTimezone: true,
  }).notNull(),
  sessionToken: varchar("sessionToken", { length: 255 }).notNull(),
});

export const VerificationTokenTable = pgTable(
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

export const FamilyTable = pgTable("families", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("createdAt", {
    withTimezone: true,
  }),
});
