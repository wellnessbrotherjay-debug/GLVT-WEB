import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // i.e./glvt/home
    const next = searchParams.get('next') ?? '/glvt/home'

    if (code) {
        // Determine the redirect URL first
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1')

        let redirectUrl = ''
        if (isLocal) {
            redirectUrl = `${origin}${next}`
        } else if (forwardedHost) {
            redirectUrl = `https://${forwardedHost}${next}`
        } else {
            redirectUrl = `${origin}${next}`
        }

        const response = NextResponse.redirect(redirectUrl)

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
                        // Set cookies on the response object
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Exchange the code for a session
        // Since our client is configured to write to `response.cookies` in `setAll`,
        // the cookies generated here will be automatically properly set on our response!
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return response
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/glvt/login?error=auth-code-error`)
}
