import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Track visitors on page loads (non-API routes)
  if (!request.nextUrl.pathname.startsWith('/api')) {
    try {
      fetch(`${request.nextUrl.origin}/api/visitors`, {
        method: 'POST',
        headers: {
          'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
          'x-real-ip': request.headers.get('x-real-ip') || '',
        },
      }).catch(() => {
        // Silently fail - visitor tracking shouldn't block requests
      });
    } catch (error) {
      // Silently fail
    }
  }

  // Handle Supabase auth
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
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Matcher: run this proxy for all routes EXCEPT static assets.
  // (?!...) = negative lookahead: skip if path starts with _next/static, _next/image, favicon.ico,
  // or ends with .svg, .png, .jpg, .jpeg, .gif, .webp. The .* at the end matches everything else.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
