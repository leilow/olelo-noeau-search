import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMoonPhase, getWeather } from '@/lib/daily-apis';

export async function GET() {
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
