import MetricCard from './MetricCard';
import { createServiceClient } from '@/lib/supabase/service';

async function getVisitorCount(): Promise<number> {
  try {
    const supabase = createServiceClient();
    if (!supabase) return 0;
    const { count, error } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true });
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function VisitorCount() {
  const count = await getVisitorCount();
  return <MetricCard label="Unique Visitors" value={count} />;
}
