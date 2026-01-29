/**
 * Utilities for phrase number search and range parsing
 */

/**
 * Parse a phrase number query into a range
 * Supports formats:
 * - "100" (single number)
 * - "1-100" (range with hyphen)
 * - "1 to 100" (range with "to")
 * - "1-100,200" (multiple ranges/comma-separated)
 */
export function parsePhraseNumberQuery(query: string): Array<{ min: number; max: number }> | null {
  if (!query || query.trim().length === 0) return null;
  
  const trimmed = query.trim();
  const ranges: Array<{ min: number; max: number }> = [];
  
  // Regex: /(\d+)\s*(?:-|to)\s*(\d+)/i
  // Matches: Number ranges like "1-100" or "1 to 100"
  //   - (\d+) captures first number
  //   - \s* matches optional whitespace
  //   - (?:-|to) matches either hyphen or "to" (non-capturing)
  //   - \s* matches optional whitespace
  //   - (\d+) captures second number
  //   - /i flag makes it case-insensitive
  // Purpose: Parse range queries like "1-100" or "1 to 100"
  const rangeRegex = /(\d+)\s*(?:-|to)\s*(\d+)/i;
  
  // Check for range patterns first
  const rangeMatch = trimmed.match(rangeRegex);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    if (!isNaN(min) && !isNaN(max) && min <= max) {
      ranges.push({ min, max });
    }
  } else {
    // Check if query is a single number (exact match)
    // Regex: /^\d+$/
    // Matches: String that is entirely digits from start to end
    // Purpose: Match exact phrase numbers like "123" (not "123abc" or "abc123")
    const exactNumberMatch = /^\d+$/.test(trimmed);
    if (exactNumberMatch) {
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num > 0) {
        ranges.push({ min: num, max: num });
      }
    } else {
      // Check for comma-separated numbers (e.g., "1,2,3" or "100,200,300")
      // Regex: /^\d+(?:\s*,\s*\d+)*$/
      // Matches: One or more numbers separated by commas (with optional whitespace)
      //   - ^\d+ starts with one or more digits
      //   - (?:\s*,\s*\d+)* zero or more comma-separated numbers
      //   - $ end of string
      // Purpose: Parse comma-separated lists like "1, 2, 3" or "100,200,300"
      const commaSeparatedRegex = /^\d+(?:\s*,\s*\d+)*$/;
      if (commaSeparatedRegex.test(trimmed)) {
        // Regex: /\d+/g
        // Matches: One or more digits (global flag finds all matches)
        // Purpose: Extract all numbers from comma-separated list
        const numbers = trimmed.match(/\d+/g);
        if (numbers) {
          for (const numStr of numbers) {
            const num = parseInt(numStr, 10);
            if (!isNaN(num) && num > 0) {
              ranges.push({ min: num, max: num });
            }
          }
        }
      }
    }
  }
  
  return ranges.length > 0 ? ranges : null;
}

/**
 * Check if a phrase number matches the query ranges
 */
export function matchesPhraseNumber(phraseNumber: number, ranges: Array<{ min: number; max: number }>): boolean {
  return ranges.some(range => phraseNumber >= range.min && phraseNumber <= range.max);
}
