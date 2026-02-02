/**
 * API request allowlist: same-origin (Origin/Referer) or internal secret.
 * Keeps routes callable by your app but not by arbitrary public callers.
 */

import type { NextRequest } from 'next/server';

const INTERNAL_SECRET_HEADER = 'x-internal-secret';

function getAllowedOrigins(): string[] {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const extra = process.env.ALLOWED_API_ORIGINS; // optional comma-separated
  const origins: string[] = [];
  if (base) {
    try {
      origins.push(new URL(base).origin);
    } catch {
      // ignore invalid URL
    }
  }
  if (extra) {
    extra.split(',').forEach((o) => {
      const t = o.trim();
      if (t) {
        try {
          origins.push(new URL(t).origin);
        } catch {
          origins.push(t);
        }
      }
    });
  }
  origins.push('http://localhost:3000', 'http://127.0.0.1:3000');
  return [...new Set(origins)];
}

function getOriginOrRefererHost(request: NextRequest): string | null {
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).origin;
    } catch {
      return null;
    }
  }
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Returns true if the request is allowed to hit /api/*:
 * - Has valid x-internal-secret (server-only), or
 * - Origin/Referer is in the allowlist (your site or localhost), or
 * - POST /api/visitors with no Origin/Referer in dev (proxy fire-and-forget).
 */
export function isAllowedApiRequest(request: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (secret && request.headers.get(INTERNAL_SECRET_HEADER) === secret) {
    return true;
  }
  const host = getOriginOrRefererHost(request);
  if (host) {
    const allowed = getAllowedOrigins();
    if (allowed.includes(host)) return true;
    // POST /api/visitors: allow when Origin matches request host (same-origin) so client ping always works
    if (
      request.method === 'POST' &&
      request.nextUrl.pathname === '/api/visitors' &&
      host === request.nextUrl.origin
    ) {
      return true;
    }
  }
  // Server-side POST to /api/visitors (proxy) has no Origin/Referer. Allow it so tracking works
  if (
    request.method === 'POST' &&
    request.nextUrl.pathname === '/api/visitors' &&
    !getOriginOrRefererHost(request)
  ) {
    return true;
  }
  return false;
}

export { INTERNAL_SECRET_HEADER };
