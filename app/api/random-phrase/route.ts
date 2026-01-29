import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getMoonPhase(): Promise<string> {
  // Simplified moon phase calculation (same as daily-pull)
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
  return 'Sunny, 78°F';
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get total count of phrases
    const { count } = await supabase
      .from('phrases')
      .select('*', { count: 'exact', head: true });

    if (!count || count === 0) {
      return NextResponse.json({ error: 'No phrases available' }, { status: 404 });
    }

    // Get a random phrase
    const randomIndex = Math.floor(Math.random() * count);
    
    const { data: phrases, error } = await supabase
      .from('phrases')
      .select('*')
      .order('phrase_numbers', { ascending: true })
      .range(randomIndex, randomIndex);

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

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in random-phrase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
