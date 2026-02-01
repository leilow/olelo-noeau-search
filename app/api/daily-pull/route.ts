import { NextResponse } from 'next/server';
import { getDailyPullData, getDailyPullCacheDate } from '@/lib/daily-pull-server';

let cache: { date: string; data: Awaited<ReturnType<typeof getDailyPullData>> } | null = null;

export async function GET() {
  const today = getDailyPullCacheDate();
  if (cache && cache.date === today) {
    return NextResponse.json(cache.data);
  }

  const result = await getDailyPullData();
  if (!result) {
    return NextResponse.json({ error: 'No phrases available' }, { status: 404 });
  }

  cache = { date: today, data: result };
  return NextResponse.json(result);
}
