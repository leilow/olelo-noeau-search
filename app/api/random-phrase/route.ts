import { NextResponse } from 'next/server';
import { phrases } from '@/lib/phrases/data';
import { getMoonPhase, getWeather } from '@/lib/daily-apis';

export async function GET() {
  try {
    if (phrases.length === 0) {
      return NextResponse.json({ error: 'No phrases available' }, { status: 404 });
    }

    const randomIndex = Math.floor(Math.random() * phrases.length);
    const phrase = phrases[randomIndex];

    const [moonPhase, weather] = await Promise.all([
      getMoonPhase(),
      getWeather(),
    ]);

    return NextResponse.json({ phrase, moonPhase, weather });
  } catch (error) {
    console.error('Error in random-phrase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
