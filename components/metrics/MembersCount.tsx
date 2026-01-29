import MetricCard from './MetricCard';

async function getMembersCount(): Promise<number> {
  try {
    const response = await fetch('/api/members/count', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      return data.count ?? 0;
    }
  } catch (error) {
    console.error('Error fetching members count:', error);
  }
  return 0;
}

export default async function MembersCount() {
  const count = await getMembersCount();
  return <MetricCard label="Members" value={count} />;
}
