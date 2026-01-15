import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  console.log("MIDDLEWARE:", pathname);

  // ==========================
  // 1️⃣ Ignorer assets & pages publiques
  // ==========================
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/public") ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  // ==========================
  // 2️⃣ Récupération session
  // ==========================
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // ==========================
  // 3️⃣ Non connecté → login
  // ==========================
  if (!session?.user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // ==========================
  // 4️⃣ Protection MA (inchangé)
  // ==========================
  if (pathname.startsWith("/MA")) {
    const role = session.user.role;
    const allowed = role === "MA"; // adapte si besoin

    if (!allowed) {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  // ==========================
  // 5️⃣ ✅ Protection TP (AJOUT)
  // ==========================
  if (pathname.startsWith("/TP")) {
    if (session.user.role !== "TP") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }

  // ==========================
  // 6️⃣ Accès racine → redirection selon rôle
  // ==========================
  if (pathname === "/") {
    if (session.user.role === "TP") {
      return NextResponse.redirect(new URL("/TP/Accueil", request.url));
    }
    if (session.user.role === "MA") {
      return NextResponse.redirect(new URL("/MA", request.url));
    }
    if (session.user.role === "CA") {
      return NextResponse.redirect(new URL("/CA", request.url));
    }
  }

  return NextResponse.next();
}

// ==========================
// MATCHER (on garde MA + TP)
// ==========================
export const config = {
  matcher: [
    "/",
    "/MA/:path*",
    "/TP/:path*",
    "/api/MA/:path*",
    "/api/TP/:path*",
  ],
};
