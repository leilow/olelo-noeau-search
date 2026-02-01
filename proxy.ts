import { NextResponse, type NextRequest } from 'next/server';
import { isAllowedApiRequest } from '@/lib/api-auth';

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    if (!isAllowedApiRequest(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Track every visit (non-API routes): unique visitor + visit log
  if (!request.nextUrl.pathname.startsWith('/api')) {
    try {
      const headers: Record<string, string> = {
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        'x-real-ip': request.headers.get('x-real-ip') || '',
        'x-visited-path': request.nextUrl.pathname,
      };
      const secret = process.env.INTERNAL_API_SECRET;
      if (secret) headers['x-internal-secret'] = secret;
      fetch(`${request.nextUrl.origin}/api/visitors`, {
        method: 'POST',
        headers,
      }).catch(() => {
        // Silently fail - visitor tracking shouldn't block requests
      });
    } catch (error) {
      // Silently fail
    }
  }

  // Handle Supabase auth (skip if env not set, e.g. build or misconfig)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { createServerClient } = await import('@supabase/ssr');
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
      });
      await supabase.auth.getUser();
    } catch {
      // Don't block response on auth errors
    }
  }

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
