import MetricCard from './MetricCard';

async function getVisitorCount(): Promise<number> {
  try {
    const response = await fetch('/api/visitors/count', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      return data.count ?? 0;
    }
  } catch (error) {
    console.error('Error fetching visitor count:', error);
  }
  return 0;
}

export default async function VisitorCount() {
  const count = await getVisitorCount();
  return <MetricCard label="Unique Visitors" value={count} />;
}
