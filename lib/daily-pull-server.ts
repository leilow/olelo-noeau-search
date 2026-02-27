/**
 * Server-only: daily pull data (phrase + moon + weather).
 * Used by the daily-pull API route and by the home page server component.
 * Phrases are bundled statically; external API results are cached per day.
 */

import { unstable_cache } from 'next/cache';
import { phrases } from '@/lib/phrases/data';
import { getMoonPhase, getWeather } from '@/lib/daily-apis';
import type { Phrase } from '@/lib/types/database';

function getHawaiiDate(): string {
  const now = new Date();
  const hawaiiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Pacific/Honolulu' }));
  return hawaiiTime.toISOString().split('T')[0];
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export interface DailyPullResult {
  phrase: Phrase;
  moonPhase: string;
  weather: string;
}

async function getDailyPullDataUncached(): Promise<DailyPullResult | null> {
  try {
    if (phrases.length === 0) return null;

    const hawaiiDate = new Date();
    const dayOfYear = getDayOfYear(hawaiiDate);
    const phraseIndex = dayOfYear % phrases.length;

    const phrase = phrases[phraseIndex];
    if (!phrase) return null;

    const [moonPhase, weather] = await Promise.all([
      getMoonPhase(),
      getWeather(),
    ]);

    return {
      phrase,
      moonPhase,
      weather,
    };
  } catch (error) {
    console.error('Error in getDailyPullData:', error);
    return null;
  }
}

export async function getDailyPullData(): Promise<DailyPullResult | null> {
  const today = getDailyPullCacheDate();
  return unstable_cache(getDailyPullDataUncached, ['daily-pull', today], {
    revalidate: 3600,
    tags: ['daily-pull'],
  })();
}

// For API route cache key
export function getDailyPullCacheDate(): string {
  return getHawaiiDate();
}
