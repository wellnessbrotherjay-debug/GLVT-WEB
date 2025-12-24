import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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

    // Refresh session if expired - required for Server Components
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();

    // 1. Redirect to /glvt/home if user is signed in OR has guest session and tries to access login or launch pages
    const hasGuestSession = request.cookies.get('glvt_guest_session')?.value === 'true';

    if (user || hasGuestSession) {
        if (url.pathname === "/glvt/login" || url.pathname === "/glvt/launch") {
            url.pathname = "/glvt/home";
            return NextResponse.redirect(url);
        }
    }

    // 2. Optional: Protect other routes (e.g. /glvt/home) if NOT signed in
    // Uncommenting this enforces auth for the app
    /*
    if (!user && url.pathname.startsWith('/glvt') && !url.pathname.includes('/login') && !url.pathname.includes('/launch') && !url.pathname.includes('/onboarding')) {
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
