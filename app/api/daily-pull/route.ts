import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMoonPhase, getWeather } from '@/lib/daily-apis';

// Simple in-memory cache (in production, use Redis or similar)
let cache: {
  date: string;
  data: any;
} | null = null;

function getHawaiiDate(): string {
  // Get current date in Hawaii timezone (HST, UTC-10)
  const now = new Date();
  const hawaiiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' }));
  return hawaiiTime.toISOString().split('T')[0];
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export async function GET() {
  const today = getHawaiiDate();

  // Check cache
  if (cache && cache.date === today) {
    return NextResponse.json(cache.data);
  }

  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: 'No phrases available' }, { status: 404 });

    // Get total count of phrases
    const { count } = await supabase
      .from('phrases')
      .select('*', { count: 'exact', head: true });

    if (!count || count === 0) {
      return NextResponse.json({ error: 'No phrases available' }, { status: 404 });
    }

    // Deterministic selection based on day of year
    const hawaiiDate = new Date();
    const dayOfYear = getDayOfYear(hawaiiDate);
    const phraseIndex = dayOfYear % count;

    // Fetch the phrase at that index (ordered by phrase_numbers)
    const { data: phrases, error } = await supabase
      .from('phrases')
      .select('*')
      .order('phrase_numbers', { ascending: true })
      .range(phraseIndex, phraseIndex);

    if (error || !phrases || phrases.length === 0) {
      return NextResponse.json({ error: 'Failed to fetch phrase' }, { status: 500 });
    }

    const [moonPhase, weather] = await Promise.all([
      getMoonPhase(),
      getWeather(),
    ]);

    const result = {
      phrase: phrases[0],
      moonPhase,
      weather,
    };

    // Cache for today
    cache = {
      date: today,
      data: result,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in daily-pull:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
