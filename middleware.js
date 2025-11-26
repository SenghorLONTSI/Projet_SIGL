import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    alert(pathname)


    // On ne touche pas aux assets ni aux APIs publiques
    if (pathname.startsWith('/_next') || pathname.startsWith('/api/public')) {
        return NextResponse.next()
    }


    const session = await auth.api.getSession({
        headers: request.headers,
    });
    // Auth obligatoire pour /app et /api
    if (!session) {
        const url = new URL("/login", request.url);
        url.searchParams.set("from", pathname);
        return NextResponse.redirect(url);
    }


    // Protection spécifique pour /MA
    if (pathname.startsWith("/MA")) {
        const role = session.user?.role
        const allowed = role === 'user' || role === 'admin' // adapte selon tes roles
        if (!allowed) {
            return NextResponse.redirect(new URL('/403', request.url))
        }
    }

    return NextResponse.next();
}

// Adapter selon ta structure
export const config = {
    matcher: ["/app/:path*",
        '/MA/:path*',
        '/api/MA/:path*'
    ],
};