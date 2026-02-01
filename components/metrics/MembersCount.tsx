import MetricCard from './MetricCard';
import { createServiceClient } from '@/lib/supabase/service';

async function getMembersCount(): Promise<number> {
  try {
    const supabase = createServiceClient();
    if (!supabase) return 0;
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) return 0;
    return data?.users?.length ?? 0;
  } catch {
    return 0;
  }
}

export default async function MembersCount() {
  const count = await getMembersCount();
  return <MetricCard label="Members" value={count} />;
}
