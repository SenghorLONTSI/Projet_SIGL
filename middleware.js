import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Exemple : tout ce qui commence par /app nécessite "visiblement" une session
    if (pathname.startsWith("/app")) {
        const sessionCookie = getSessionCookie(request);

        if (!sessionCookie) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

// Adapter selon ta structure
export const config = {
    matcher: ["/app/:path*"],
};