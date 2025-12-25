import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // CRITICAL: Check for guest session cookie FIRST - bypass all auth if present
    const guestCookie = request.cookies.get('glvt_guest_session');
    if (guestCookie?.value === 'true') {
        console.log('Middleware: Guest session detected, bypassing auth checks');
        // Allow guest to access any /glvt/* route
        if (pathname.startsWith('/glvt/')) {
            // Only redirect from login page
            if (pathname === '/glvt/login') {
                return NextResponse.redirect(new URL('/glvt/launch', request.url));
            }
            return NextResponse.next();
        }
    }

    // Only check Supabase auth if NOT a guest session
    try {
        let supabaseResponse = NextResponse.next({
            request,
        });

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            request.cookies.set(name, value)
                        );
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        // Redirect authenticated users away from login/launch
        if (user && (pathname === '/glvt/login' || pathname === '/glvt/launch')) {
            return NextResponse.redirect(new URL('/glvt/home', request.url));
        }

        return supabaseResponse;
    } catch (error) {
        console.error('Middleware error:', error);
        // On error, just let the request through
        return NextResponse.next();
    }
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
