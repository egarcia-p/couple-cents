import { verifySession } from "@/app/lib/dal";
import { db } from "@/app/lib/db";
import { userSettings as userSettingsTable } from "../../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const session = await verifySession();

    const userSettings = await db
      .select({ language: userSettingsTable.language })
      .from(userSettingsTable)
      .where(eq(userSettingsTable.userId, session.user.id))
      .limit(1);

    const locale = userSettings[0]?.language || "en-US";

    // Set cookie with 1-year expiration
    const cookieStore = await cookies();
    cookieStore.set("NEXT_LOCALE", locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return NextResponse.json({ locale });
  } catch (error) {
    console.error("Error fetching user locale:", error);
    return NextResponse.json({ locale: "en-US" }, { status: 200 });
  }
}
