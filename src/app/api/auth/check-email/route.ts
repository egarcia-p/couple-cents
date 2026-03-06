// /app/api/auth/check-email/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Always return the same response regardless of whether the email exists.
  // This prevents user enumeration attacks where an attacker could probe
  // which emails are registered in the system.
  return NextResponse.json({ message: "ok" }, { status: 200 });
}
