'use client';

import { useEffect } from 'react';

/**
 * Pings POST /api/visitors on mount so visits/visitors are recorded via the Node API route
 * (which has full env). Edge middleware may not have SUPABASE_SERVICE_ROLE_KEY in some hosts.
 */
export default function VisitTracker() {
  useEffect(() => {
    let path = '';
    if (typeof window !== 'undefined') {
      path = window.location.pathname;
      if (path === '/search') {
        const q = new URLSearchParams(window.location.search).get('q');
        if (q?.trim()) path += '?q=' + encodeURIComponent(q.trim());
      } else {
        path += window.location.search;
      }
    }
    fetch('/api/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  }, []);
  return null;
}
