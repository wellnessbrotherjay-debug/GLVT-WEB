import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/glvt/home'

    if (code) {
        const cookieStore = {
            getAll() {
                // @ts-ignore - Next.js Request cookies are read-only here but simple read is fine for init
                // We need a proper cookie store for the client
                return []
            }
        }

        // We can't use 'cookies()' from next/headers in a Route Handler the same way as Server Actions
        // So we use standard response modification
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        // Parse cookies from the request headers
                        const cookieHeader = request.headers.get('Cookie') ?? ''
                        return cookieHeader.split('; ').map(c => {
                            const [name, value] = c.split('=')
                            return { name, value }
                        })
                    },
                    setAll(cookiesToSet) {
                        // We'll set these on the response
                    },
                },
            }
        )

        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Create response to redirect
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocal = origin.includes('localhost')

            // Determine the redirect URL
            let redirectUrl = ''
            if (isLocal) {
                redirectUrl = `${origin}${next}`
            } else if (forwardedHost) {
                redirectUrl = `https://${forwardedHost}${next}`
            } else {
                redirectUrl = `${origin}${next}`
            }

            const response = NextResponse.redirect(redirectUrl)

            // IMPORTANT: The `exchangeCodeForSession` updated the internal client state.
            // We must now persist the new session cookies to the actual response headers.
            // We do this by re-creating the client with a cookie setter that writes to the response object.
            const supabaseResponseClient = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() {
                            const cookieHeader = request.headers.get('Cookie') ?? ''
                            return cookieHeader.split('; ').map(c => {
                                const [name, value] = c.split('=')
                                return { name, value }
                            })
                        },
                        setAll(cookiesToSet) {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                response.cookies.set(name, value, options)
                            )
                        },
                    },
                }
            )

            // We just need to "touch" the session or update it to ensure cookies are set on the response
            // Re-get user/session to trigger the setAll
            await supabaseResponseClient.auth.getSession()

            return response
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/glvt/login?error=auth-code-error`)
}
