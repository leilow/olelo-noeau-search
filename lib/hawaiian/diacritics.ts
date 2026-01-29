/**
 * Hawaiian diacritics normalization and utilities
 */

export const ALPHABET = ['a', 'e', 'i', 'o', 'u', 'h', 'k', 'l', 'm', 'n', 'p', 'w', 'ʻ'] as const;

/**
 * Normalize various okina characters to the canonical ʻokina (U+02BB)
 */
export function normalizeOkina(text: string): string {
  return text
    // Regex: /[''ʼ]/g
    // Matches: Curly apostrophes (U+2018, U+2019) and modifier letter apostrophe (U+02BC)
    // Purpose: Normalize various apostrophe-like characters to canonical ʻokina (U+02BB)
    .replace(/[''ʼ]/g, 'ʻ')
    // Regex: /'/g
    // Matches: Straight apostrophe (U+0027)
    // Purpose: Also normalize straight apostrophes to ʻokina
    .replace(/'/g, 'ʻ');
}

/**
 * Check if a word contains valid Hawaiian characters
 */
export function isValidHawaiianWord(word: string): boolean {
  // Regex: /^[a-zA-Zʻʼ'\- ]+$/
  // Matches: Start to end of string containing only:
  //   - Letters (a-z, A-Z)
  //   - ʻokina (U+02BB)
  //   - Modifier letter apostrophe (U+02BC)
  //   - Straight apostrophe (U+0027)
  //   - Hyphens (-)
  //   - Spaces
  // Purpose: Validate that a word contains only valid Hawaiian characters
  const hawaiianRegex = /^[a-zA-Zʻʼ'\- ]+$/;
  return hawaiianRegex.test(word);
}

/**
 * Extract Hawaiian letter from phrase (first character, normalized)
 */
export function getHawaiianLetter(phrase: string): string {
  const normalized = normalizeOkina(phrase.trim());
  if (normalized.length === 0) return '';
  const firstChar = normalized[0].toLowerCase();
  return ALPHABET.includes(firstChar as typeof ALPHABET[number]) ? firstChar : '';
}

/**
 * Remove diacritics (kahakō/macrons) from text for search matching
 * Converts: ā, ē, ī, ō, ū → a, e, i, o, u
 */
export function removeDiacritics(text: string): string {
  return text
    .normalize('NFD') // Decompose characters (e.g., ā → a + ̄)
    // Regex: /[\u0300-\u036f]/g
    // Matches: Unicode combining diacritical marks (U+0300 to U+036F)
    //   Includes: macrons (kahakō), accents, cedillas, etc.
    // Purpose: Remove all diacritics after NFD normalization (ā → a, ē → e, etc.)
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalize text for search (handles okina variations and removes diacritics)
 * This allows searching without diacritics: "aloha aina" matches "aloha ʻāina"
 * Also treats ʻokina as equivalent to space for word boundary matching
 */
export function normalizeForSearch(text: string): string {
  const withOkina = normalizeOkina(text.toLowerCase().trim());
  const withoutDiacritics = removeDiacritics(withOkina);
  // Regex: /ʻ/g
  // Matches: ʻokina character (U+02BB)
  // Purpose: Replace ʻokina with space so "aloha aina" matches "aloha ʻāina"
  // Regex: /\s+/g
  // Matches: One or more whitespace characters (spaces, tabs, newlines, etc.)
  // Purpose: Normalize multiple spaces to single space
  return withoutDiacritics.replace(/ʻ/g, ' ').replace(/\s+/g, ' ').trim();
}
