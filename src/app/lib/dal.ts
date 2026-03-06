import "server-only";

import { cookies, headers } from "next/headers";
import { auth } from "./auth";
import { cache } from "react";
import { redirect } from "next/navigation";
import { safeDecrypt } from "./crypto";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) {
    redirect("/");
  }

  // Decrypt PII fields from the user record
  const user = {
    ...session.user,
    name: safeDecrypt(session.user.name),
  };

  return { isAuth: true, user };
});
