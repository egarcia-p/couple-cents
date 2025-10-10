import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/"];

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const sessionCookie = getSessionCookie(request);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  //This is not enough, we need to check if the user is authenticated
  if (
    isPublicRoute &&
    sessionCookie &&
    !request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return handleI18nRouting(request);
}

// Routes Middleware should not run on
export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
