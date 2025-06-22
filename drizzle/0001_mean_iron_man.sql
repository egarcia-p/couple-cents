CREATE TABLE IF NOT EXISTS "user_budget_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"category" varchar(255) NOT NULL,
	"budget" numeric NOT NULL
);
