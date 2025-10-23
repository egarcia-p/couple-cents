CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"language" varchar(255) NOT NULL,
	"timezone" varchar(255) NOT NULL
);
