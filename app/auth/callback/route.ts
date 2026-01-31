import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/bingo';

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // The `setAll` method was called from a Server Component.
                        }
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development';

            let redirectUrl = `${origin}${next}`;
            if (!isLocalEnv && forwardedHost) {
                redirectUrl = `https://${forwardedHost}${next}`;
            }

            // Create the redirect response
            const response = NextResponse.redirect(redirectUrl);

            // IMPORTANT: Explicitly Copy Updated Cookies to the Response
            // Next.js Route Handlers generally sync cookies() with response, but for redirects
            // sometimes it's safer to be explicit if there are issues.
            // However, since we used cookieStore.set() above, Next.js *should* handle it.
            // But let's verify if we can force it.

            // Actually, the most robust way in newer Next.js with Supabase SSR is to just return the redirect checking ENV.
            // If the user was having issues, it might be due to the `request` URL origin vs actual URL.

            return response;
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent('사용자를 인증할 수 없습니다.')}`);
}
