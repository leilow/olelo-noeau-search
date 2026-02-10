/**
 * Server-only: fetch all phrases (batched). Use in Server Components or API routes.
 * Cached 5 min to avoid Supabase round-trips on every request.
 */

import { unstable_cache } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/service';
import type { Phrase } from '@/lib/types/database';

const BATCH_SIZE = 1000;
const CACHE_REVALIDATE_SECONDS = 300; // 5 min

async function fetchAllPhrasesUncached(): Promise<Phrase[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];

  const allPhrases: Phrase[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('phrases')
      .select('*')
      .order('phrase_numbers', { ascending: true })
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      console.error('Error fetching phrases:', error);
      return allPhrases;
    }

    if (data && data.length > 0) {
      allPhrases.push(...(data as Phrase[]));
      offset += BATCH_SIZE;
      hasMore = data.length === BATCH_SIZE;
    } else {
      hasMore = false;
    }
  }

  return allPhrases;
}

export async function fetchAllPhrases(): Promise<Phrase[]> {
  return unstable_cache(fetchAllPhrasesUncached, ['phrases-all'], {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: ['phrases'],
  })();
}
