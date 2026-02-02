'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function buildPath(pathname: string, searchParams: URLSearchParams | null): string {
  if (pathname === '/search') {
    const q = searchParams?.get('q')?.trim();
    return q ? pathname + '?q=' + encodeURIComponent(q) : pathname;
  }
  const search = searchParams?.toString();
  return search ? pathname + '?' + search : pathname;
}

/**
 * Pings POST /api/visitors on mount and when URL changes so visits/visitors are recorded.
 * For /search we only send the q param; debounced so we record when they've actually searched.
 */
export default function VisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sentRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const path = buildPath(pathname, searchParams);
    if (path === sentRef.current) return;

    const send = () => {
      sentRef.current = path;
      fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
        keepalive: true,
      }).catch(() => {});
    };

    if (pathname === '/search') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(send, 800);
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
    send();
  }, [pathname, searchParams]);

  return null;
}
