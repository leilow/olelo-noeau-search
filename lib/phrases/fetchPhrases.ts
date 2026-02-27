/**
 * Server-only: fetch all phrases.
 * Data is now bundled statically — no Supabase round-trip needed.
 */

import { phrases } from './data';
import type { Phrase } from '@/lib/types/database';

export async function fetchAllPhrases(): Promise<Phrase[]> {
  return phrases;
}
