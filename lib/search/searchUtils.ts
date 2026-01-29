/**
 * Search utilities for phrase searching
 */

import { normalizeForSearch } from '@/lib/hawaiian/diacritics';
import { Phrase } from '@/lib/types/database';

export interface SearchResult extends Phrase {
  relevanceScore: number;
  matchedFields: string[];
}

/**
 * Calculate relevance score for a phrase match
 * Higher score = more relevant
 */
function calculateRelevanceScore(
  phrase: Phrase,
  query: string,
  matchedFields: string[]
): number {
  let score = 0;
  
  // Weight different fields
  if (matchedFields.includes('phrase_number')) score += 5; // Exact phrase number match is very relevant
  if (matchedFields.includes('hawaiian')) score += 3;
  if (matchedFields.includes('english')) score += 2;
  if (matchedFields.includes('meaning')) score += 1;
  if (matchedFields.includes('tags')) score += 1;
  
  // Bonus for exact phrase match
  const normalizedQuery = normalizeForSearch(query);
  const hawaiian = normalizeForSearch(phrase.hawaiian_phrase);
  const english = phrase.english_phrase ? normalizeForSearch(phrase.english_phrase) : '';
  
  if (hawaiian === normalizedQuery || english === normalizedQuery) {
    score += 5; // Exact match bonus
  }
  
  // Bonus for match at start of phrase
  if (hawaiian.startsWith(normalizedQuery) || english.startsWith(normalizedQuery)) {
    score += 2; // Starts with bonus
  }
  
  return score;
}

/**
 * Check if text matches query with word boundaries
 * Supports multi-word queries: all words must be present
 */
function matchesQuery(text: string, query: string): boolean {
  const normalizedText = normalizeForSearch(text);
  const normalizedQuery = normalizeForSearch(query);
  
  // Regex: /\s+/
  // Matches: One or more whitespace characters (spaces, tabs, etc.)
  // Purpose: Split query into individual words for multi-word search
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
  
  if (queryWords.length === 0) return false;
  
  // For single word, check substring match
  if (queryWords.length === 1) {
    return normalizedText.includes(queryWords[0]);
  }
  
  // For multiple words, check if all words are present (anywhere in text)
  // This allows "aloha aina" to match "papale ai aina, ku u aloha"
  return queryWords.every(word => normalizedText.includes(word));
}

/**
 * Search phrases with relevance ranking
 * Also supports searching by phrase numbers (digits in query)
 */
export function searchPhrases(phrases: Phrase[], query: string): SearchResult[] {
  if (!query || query.length < 2) {
    return phrases.map(p => ({ ...p, relevanceScore: 0, matchedFields: [] }));
  }
  
  const normalizedQuery = normalizeForSearch(query);
  const results: SearchResult[] = [];
  
  // Extract exact number(s) from query for phrase number matching
  // Regex: /^\d+$/
  // Matches: String that is entirely digits from start to end
  // Purpose: Check if query is purely numeric (e.g., "123")
  const isPureNumber = /^\d+$/.test(query.trim());
  
  // Regex: /\b\d+\b/g
  // Matches: Complete numbers (digits) surrounded by word boundaries
  //   - \b is word boundary (start/end of string or non-word character)
  //   - \d+ matches one or more digits
  //   - \b ensures we match complete numbers, not parts of numbers
  // Purpose: Extract standalone numbers from queries like "cat 123" or "phrase 1-100"
  const numberMatches = query.match(/\b\d+\b/g);
  const queryNumbers = numberMatches ? numberMatches.map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n > 0) : [];
  
  for (const phrase of phrases) {
    const matchedFields: string[] = [];
    
    // Check phrase number matching
    if (isPureNumber) {
      // Query is purely numeric (e.g., "123"), match exact phrase number only
      const queryNum = parseInt(query.trim(), 10);
      if (!isNaN(queryNum) && phrase.phrase_numbers === queryNum) {
        matchedFields.push('phrase_number');
      }
    } else if (queryNumbers.length > 0) {
      // Query contains numbers mixed with text (e.g., "cat 123")
      // Match if phrase number matches any extracted number
      if (queryNumbers.includes(phrase.phrase_numbers)) {
        matchedFields.push('phrase_number');
      }
    }
    
    // Check Hawaiian phrase
    if (matchesQuery(phrase.hawaiian_phrase, query)) {
      matchedFields.push('hawaiian');
    }
    
    // Check English phrase
    if (phrase.english_phrase && matchesQuery(phrase.english_phrase, query)) {
      matchedFields.push('english');
    }
    
    // Check meaning
    if (phrase.meaning_phrase && matchesQuery(phrase.meaning_phrase, query)) {
      matchedFields.push('meaning');
    }
    
    // Check tags
    if (phrase.tags && phrase.tags.length > 0) {
      const tagMatch = phrase.tags.some(tag => 
        matchesQuery(tag, query)
      );
      if (tagMatch) {
        matchedFields.push('tags');
      }
    }
    
    // If any field matched, add to results
    if (matchedFields.length > 0) {
      const relevanceScore = calculateRelevanceScore(phrase, query, matchedFields);
      results.push({
        ...phrase,
        relevanceScore,
        matchedFields,
      });
    }
  }
  
  // Sort by relevance score (descending), then by phrase_numbers
  results.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return a.phrase_numbers - b.phrase_numbers;
  });
  
  return results;
}

/**
 * Highlight search terms in text
 * Works even when query has no diacritics but text does
 * Only highlights if the normalized text actually contains the normalized query
 */
export function highlightSearchTerms(text: string, query: string): string {
  if (!query || query.length < 2) return text;
  
  const normalizedQuery = normalizeForSearch(query);
  const normalizedText = normalizeForSearch(text);
  
  // Critical safety check: only highlight if normalized text contains the full normalized query
  // This prevents highlighting "had" when searching for "happy"
  if (!normalizedText.includes(normalizedQuery)) {
    return text;
  }
  
  // For multi-word queries, highlight each word separately
  // Regex: /\s+/
  // Matches: One or more whitespace characters
  // Purpose: Split query into individual words for highlighting
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
  if (queryWords.length === 0) return text;
  
  // Build character-by-character mapping: normalized index -> original index
  // We need to reconstruct the normalized text character-by-character to build accurate mapping
  // This accounts for: lowercase, okina normalization, diacritic removal, okina->space, space collapsing
  const normToOrig: number[] = [];
  let normPos = 0;
  let lastWasSpace = false;
  
  for (let origPos = 0; origPos < text.length && normPos < normalizedText.length; origPos++) {
    const char = text[origPos];
    let charLower = char.toLowerCase();
    
    // Normalize okina variations
    if (charLower === "'" || charLower === "'" || charLower === "'" || charLower === "ʼ") {
      charLower = 'ʻ';
    }
    
    // Replace ʻokina with space
    if (charLower === 'ʻ') {
      charLower = ' ';
    }
    
    // Remove diacritics using NFD
    let normalizedChar = charLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Handle space collapsing: multiple spaces become one
    if (normalizedChar === ' ') {
      if (lastWasSpace) {
        // Skip this space (already have one)
        continue;
      }
      lastWasSpace = true;
    } else {
      lastWasSpace = false;
    }
    
    // Map each character in normalized version to original position
    for (let i = 0; i < normalizedChar.length && normPos < normalizedText.length; i++) {
      // Verify this character matches what we expect in normalized text
      if (normalizedText[normPos] === normalizedChar[i]) {
        normToOrig[normPos] = origPos;
        normPos++;
      } else {
        // Mismatch - this shouldn't happen if normalization is consistent
        // Skip this character to avoid incorrect mapping
        break;
      }
    }
  }
  
  // Find matches for each word and map to original positions
  const highlights: Array<{ start: number; end: number }> = [];
  
  for (const word of queryWords) {
    // Verify this word actually exists in normalized text before highlighting
    if (!normalizedText.includes(word)) {
      continue;
    }
    
    let searchPos = 0;
    while (true) {
      const matchPos = normalizedText.indexOf(word, searchPos);
      if (matchPos === -1) break;
      
      // Get original start and end positions from mapping
      const origStart = normToOrig[matchPos];
      const origEnd = normToOrig[matchPos + word.length - 1];
      
      // Double-check positions are valid
      if (origStart !== undefined && origEnd !== undefined && origStart <= origEnd && origEnd < text.length) {
        // Final safety check: verify the original text at this position normalizes to the word we're looking for
        const originalSubstring = text.substring(origStart, origEnd + 1);
        const normalizedSubstring = normalizeForSearch(originalSubstring);
        
        // Only highlight if the normalized substring contains our word
        // This prevents highlighting "had" when searching for "happy"
        if (normalizedSubstring.includes(word)) {
          // End is exclusive for substring, so add 1
          highlights.push({ start: origStart, end: origEnd + 1 });
        }
      }
      
      searchPos = matchPos + 1;
    }
  }
  
  if (highlights.length === 0) return text;
  
  // Sort by start position (reverse order for easier insertion from end)
  highlights.sort((a, b) => b.start - a.start);
  
  // Remove overlapping highlights (keep first/longest)
  const final: Array<{ start: number; end: number }> = [];
  for (const h of highlights) {
    const overlaps = final.some(f => 
      (h.start >= f.start && h.start < f.end) ||
      (h.end > f.start && h.end <= f.end) ||
      (h.start <= f.start && h.end >= f.end)
    );
    if (!overlaps) {
      final.push(h);
    }
  }
  
  // Apply highlights to original text
  let result = text;
  for (const h of final) {
    result = result.substring(0, h.start) + 
             `<mark class="bg-highlight">${result.substring(h.start, h.end)}</mark>` + 
             result.substring(h.end);
  }
  
  return result;
}
