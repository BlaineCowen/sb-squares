import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const token = await getToken({ req });

  // Skip checking for API routes
  if (path.startsWith("/api")) return NextResponse.next();

  // Check DB version match
  if (token && token.user?.dbVersion !== process.env.DB_VERSION) {
    console.log(`DB version mismatch: 
      Token ${token.user?.dbVersion} vs Env ${process.env.DB_VERSION}`);
    // Remove redirect temporarily for testing
    // return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth).*)"],
};
