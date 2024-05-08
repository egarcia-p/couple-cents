CREATE TABLE IF NOT EXISTS "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" bigint,
	"id_token" text,
	"scope" text,
	"session_state" text,
	"token_type" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "families" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"createdAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"sessionToken" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"isExpense" boolean NOT NULL,
	"amount" numeric NOT NULL,
	"note" text,
	"establishment" varchar(255) NOT NULL,
	"category" varchar(255) NOT NULL,
	"isEssential" boolean NOT NULL,
	"userId" integer NOT NULL,
	"transactionDate" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"emailVerified" timestamp with time zone,
	"familyId" integer,
	"image" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_token" (
	"identifier" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_idx" ON "users" ("email");