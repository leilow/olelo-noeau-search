import { NextResponse, type NextRequest } from 'next/server';
import { isAllowedApiRequest } from '@/lib/api-auth';

/** Edge-safe SHA-256 hex hash (Web Crypto). */
async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Track visit by writing to Supabase REST from Edge (no self-fetch). */
async function trackVisit(request: NextRequest): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const salt = process.env.IP_HASH_SALT;
  if (!url || !serviceKey || !salt) return;

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
  const hash = await sha256Hex(ip + salt);
  const now = new Date().toISOString();
  const path = request.nextUrl.pathname.slice(0, 500);

  const rest = `${url.replace(/\/$/, '')}/rest/v1`;
  const headers: Record<string, string> = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates',
  };

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 2500);

  try {
    await fetch(`${rest}/visitors`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ ip_hash: hash, last_seen: now }),
      signal: controller.signal,
    });
    await fetch(`${rest}/visits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ip_hash: hash, path }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(t);
  }
}

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

  // Track every visit (non-API routes): write to Supabase from Edge so we don't rely on self-fetch.
  if (!request.nextUrl.pathname.startsWith('/api')) {
    try {
      await trackVisit(request);
    } catch {
      // Don't block response on tracking errors
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
