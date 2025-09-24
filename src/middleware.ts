import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/"];

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

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
