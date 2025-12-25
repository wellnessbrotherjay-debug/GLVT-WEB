```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // CRITICAL: Check for guest session cookie FIRST - bypass all auth if present
    const guestCookie = request.cookies.get('glvt_guest_session');
    if (guestCookie?.value === 'true') {
        console.log('Middleware: Guest session detected, bypassing auth checks');
        // Allow guest to access any /glvt/* route except login/launch
        if (pathname.startsWith('/glvt/') && !pathname.startsWith('/glvt/login') && !pathname.startsWith('/glvt/launch')) {
            return NextResponse.next();
        }
        // Redirect guest from login/launch to home
        if (pathname === '/glvt/login' || pathname === '/glvt/launch') {
            return NextResponse.redirect(new URL('/glvt/home', request.url));
        }
    }

    // Only check Supabase auth if NOT a guest session
    try {
        const response = NextResponse.next({
            request: {
                headers: request.headers,
            },
       url.pathname = '/glvt/login';
       return NextResponse.redirect(url);
    }
    */

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
