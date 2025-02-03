import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const token = await getToken({ req });

  // Skip checking for API routes
  if (path.startsWith("/api")) return NextResponse.next();

  // Check DB version match
  if (token && token.user?.dbVersion !== process.env.DB_VERSION) {
    const response = NextResponse.redirect(new URL("/auth/signout", req.url));
    response.cookies.delete("next-auth.session-token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth).*)"],
};
