import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Zones que tu veux protéger plus tard
  if (
    pathname.startsWith("/journal") ||
    pathname.startsWith("/journaux") ||
    pathname.startsWith("/entretiens")
  ) {
    // Pour l’instant on laisse passer tout le monde
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/journal/:path*",
    "/journaux/:path*",
    "/entretiens/:path*",
  ],
};
