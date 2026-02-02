'use client';

import { useEffect } from 'react';

/**
 * Pings POST /api/visitors on mount so visits/visitors are recorded via the Node API route
 * (which has full env). Edge middleware may not have SUPABASE_SERVICE_ROLE_KEY in some hosts.
 */
export default function VisitTracker() {
  useEffect(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    fetch('/api/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  }, []);
  return null;
}
