import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import createMiddleware from "next-intl/middleware";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/"];

const routing = {
  locales: ["en-US", "es-MX"],

  pathnames: {
    "/": { "en-US": "/", es: "/" },
    "/dashboard": { "en-US": "/dashboard", es: "/dashboard" },
    "/dashboard/budget": {
      "en-US": "/dashboard/budget",
      es: "/dashboard/presupuesto",
    },
    "/dashboard/history": {
      "en-US": "/dashboard/history",
      es: "/dashboard/historial",
    },
    "/dashboard/profile": {
      "en-US": "/dashboard/profile",
      es: "/dashboard/perfil",
    },
    "/dashboard/transactions": {
      "en-US": "/dashboard/transactions",
      es: "/dashboard/transacciones",
    },
    "/dashboard/transactions/create": {
      "en-US": "/dashboard/transactions/create",
      es: "/dashboard/transacciones/crear",
    },
    "/dashboard/transactions/[id]/edit": {
      "en-US": "/dashboard/transactions/[id]/edit",
      es: "/dashboard/transacciones/[id]/editar",
    },
  },
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isPublicRoute = publicRoutes.includes(path);

  const sessionCookie = getSessionCookie(request);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    isPublicRoute &&
    sessionCookie &&
    !request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const preferredLocale = getLocaleForRequest(request);

  const handleI18nRouting = createMiddleware({
    defaultLocale: preferredLocale,
    ...routing,
  });

  return handleI18nRouting(request);
}

// Routes Middleware should not run on
export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};

function getLocaleForRequest(request: NextRequest): string {
  // Check NEXT_LOCALE cookie first
  const nextLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (nextLocale) {
    return nextLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("Accept-Language");
  if (acceptLanguage?.startsWith("es")) {
    return "es-MX";
  }

  return "en-US";
}
