import MetricCard from './MetricCard';
import { createServiceClient } from '@/lib/supabase/service';

const VISITS_SINCE = '2026-01-01T00:00:00.000Z'; // Jan 2026 UTC

async function getVisitCount(): Promise<number> {
  try {
    const supabase = createServiceClient();
    if (!supabase) return 0;
    const { count, error } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .gte('visited_at', VISITS_SINCE);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function VisitorCount() {
  const count = await getVisitCount();
  return <MetricCard label="Total Visits" value={count} />;
}
