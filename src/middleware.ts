import authConfig from "./auth.config";
import NextAuth from "next-auth";
//export const { auth: middleware } = NextAuth(authConfig);
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Assume a "Cookie:nextjs=fast" header to be present on the incoming request
  // Getting cookies from the request using the `RequestCookies` API
  let cookie = request.cookies.get("authjs.session-token");
  //   console.log(cookie);
  //   const allCookies = request.cookies.getAll();
  //   console.log("ALL");
  //   console.log(allCookies);

  const response = NextResponse.next();
  if (cookie) {
    // Getting cookies from the request using the `RequestCookies` API
    // Setting cookies on the response using the `ResponseCookies` API

    response.cookies.set({
      name: cookie.name,
      value: cookie.value,
      path: "/",
      httpOnly: true,
    });
    cookie = response.cookies.get("authjs.session-token");
  }

  return response;
}
