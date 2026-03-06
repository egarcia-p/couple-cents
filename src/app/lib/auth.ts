import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/app/lib/db"; // your drizzle instance
import * as schema from "../../../drizzle/schema";
import { nextCookies } from "better-auth/next-js";
import { encrypt } from "./crypto";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: [process.env.AUTH_TRUSTED_ORIGIN as string],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
      redirectURI: `${process.env.AUTH_TRUSTED_ORIGIN}/api/auth/callback/github`,
    },
    google: {
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      redirectURI: `${process.env.AUTH_TRUSTED_ORIGIN}/api/auth/callback/google`,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Encrypt the user's display name before storing in the database.
          // Email is NOT encrypted because Better Auth needs it for login lookups.
          // The email remains in plain text as the authentication identifier.
          return {
            data: {
              ...user,
              name: encrypt(user.name),
            },
          };
        },
      },
      update: {
        before: async (user) => {
          // Re-encrypt name if it's being updated
          const updated: Record<string, unknown> = { ...user };
          if (user.name) {
            updated.name = encrypt(user.name);
          }
          return { data: updated };
        },
      },
    },
  },
  plugins: [nextCookies()],
});
