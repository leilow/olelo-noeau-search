import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

async function getMoonPhase(): Promise<string> {
  // Simplified moon phase calculation
  // In production, use a proper moon phase API or library
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // Simple approximation (not astronomically accurate)
  const daysSinceNewMoon = (year * 365 + month * 30 + day) % 29.5;
  
  if (daysSinceNewMoon < 3.7) return 'New Moon';
  if (daysSinceNewMoon < 7.4) return 'Waxing Crescent';
  if (daysSinceNewMoon < 11.1) return 'First Quarter';
  if (daysSinceNewMoon < 14.8) return 'Waxing Gibbous';
  if (daysSinceNewMoon < 18.5) return 'Full Moon';
  if (daysSinceNewMoon < 22.2) return 'Waning Gibbous';
  if (daysSinceNewMoon < 25.9) return 'Last Quarter';
  return 'Waning Crescent';
}

async function getWeather(): Promise<string> {
  // Placeholder - in production, use a weather API
  // For now, return a simple message
  return 'Sunny, 78°F';
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
