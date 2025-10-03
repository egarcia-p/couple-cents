// /app/api/auth/check-email/route.ts
import { NextResponse } from "next/server";
import { db } from "@/app/lib/db"; // however you check user existence
import { users } from "../../../../../drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.json();
  const email: string = body.email;

  const user = await db
    .select({
      email: users.email,
    })
    .from(users)
    .where(eq(users.email, email));

  //validate user existence
  if (!user[0]?.email) {
    return NextResponse.json({ exists: false }, { status: 404 });
  }

  return NextResponse.json({ exists: true });
}
