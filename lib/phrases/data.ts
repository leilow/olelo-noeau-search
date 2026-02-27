/**
 * Static phrase data — bundled at build time by Next.js.
 * ~2,941 phrases (~1.86 MB JSON). Never changes at runtime.
 */

import phrasesJson from '@/data/phrases-with-meta-tags.json';
import type { Phrase } from '@/lib/types/database';

export const phrases: Phrase[] = phrasesJson as Phrase[];
