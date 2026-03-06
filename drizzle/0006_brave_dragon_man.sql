ALTER TABLE "transactions" ALTER COLUMN "amount" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "establishment" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_budget_settings" ALTER COLUMN "budget" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_hash" text;