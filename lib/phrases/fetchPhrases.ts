/**
 * Server-only: fetch all phrases (batched). Use in Server Components or API routes.
 */

import { createClient } from '@/lib/supabase/server';
import type { Phrase } from '@/lib/types/database';

const BATCH_SIZE = 1000;

export async function fetchAllPhrases(): Promise<Phrase[]> {
  const supabase = await createClient();
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
