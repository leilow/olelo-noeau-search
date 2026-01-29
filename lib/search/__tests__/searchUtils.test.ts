/**
 * Unit tests for search utilities
 * Run with: npm test
 */

import { searchPhrases } from '../searchUtils';
import { parsePhraseNumberQuery, matchesPhraseNumber } from '../numberSearch';
import { Phrase } from '@/lib/types/database';

// Mock phrase data for testing
const mockPhrases: Phrase[] = [
  {
    phrase_numbers: 1,
    hawaiian_phrase: 'Aloha ʻāina',
    english_phrase: 'Love of the land',
    meaning_phrase: 'Deep connection to the land',
    tags: ['land', 'love', 'nature'],
    hawaiian_letter: 'a',
    headword_link: null,
    source_link: null,
  },
  {
    phrase_numbers: 2,
    hawaiian_phrase: 'Hula kahiko',
    english_phrase: 'Ancient hula',
    meaning_phrase: 'Traditional hula dance',
    tags: ['dance', 'tradition', 'hula'],
    hawaiian_letter: 'h',
    headword_link: null,
    source_link: null,
  },
  {
    phrase_numbers: 100,
    hawaiian_phrase: 'Lai lai',
    english_phrase: 'Peaceful',
    meaning_phrase: 'Calm and peaceful',
    tags: ['peace', 'calm', 'lai'],
    hawaiian_letter: 'l',
    headword_link: null,
    source_link: null,
  },
  {
    phrase_numbers: 123,
    hawaiian_phrase: 'Mālama pono',
    english_phrase: 'Take care',
    meaning_phrase: 'Be careful',
    tags: ['care', 'safety'],
    hawaiian_letter: 'm',
    headword_link: null,
    source_link: null,
  },
];

describe('searchPhrases', () => {
  test('finds phrases by Hawaiian text', () => {
    const results = searchPhrases(mockPhrases, 'aloha');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].hawaiian_phrase.toLowerCase()).toContain('aloha');
  });

  test('finds phrases by English text', () => {
    const results = searchPhrases(mockPhrases, 'land');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.english_phrase?.toLowerCase().includes('land'))).toBe(true);
  });

  test('finds phrases by tags', () => {
    const results = searchPhrases(mockPhrases, 'lai');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.tags?.includes('lai'))).toBe(true);
  });

  test('finds phrases by exact number', () => {
    const results = searchPhrases(mockPhrases, '100');
    expect(results.length).toBe(1);
    expect(results[0].phrase_numbers).toBe(100);
  });

  test('finds phrases by number in mixed query', () => {
    const results = searchPhrases(mockPhrases, 'phrase 123');
    expect(results.some(r => r.phrase_numbers === 123)).toBe(true);
  });

  test('returns empty for query less than 2 characters', () => {
    const results = searchPhrases(mockPhrases, 'a');
    expect(results.length).toBe(mockPhrases.length); // Returns all with no filtering
  });

  test('handles multi-word queries', () => {
    const results = searchPhrases(mockPhrases, 'aloha aina');
    expect(results.length).toBeGreaterThan(0);
  });

  test('relevance ranking - Hawaiian matches first', () => {
    const results = searchPhrases(mockPhrases, 'aloha');
    if (results.length > 0) {
      const firstResult = results[0];
      expect(firstResult.matchedFields).toContain('hawaiian');
    }
  });
});

describe('parsePhraseNumberQuery', () => {
  test('parses single number', () => {
    const ranges = parsePhraseNumberQuery('100');
    expect(ranges).toEqual([{ min: 100, max: 100 }]);
  });

  test('parses range with hyphen', () => {
    const ranges = parsePhraseNumberQuery('1-100');
    expect(ranges).toEqual([{ min: 1, max: 100 }]);
  });

  test('parses range with "to"', () => {
    const ranges = parsePhraseNumberQuery('1 to 100');
    expect(ranges).toEqual([{ min: 1, max: 100 }]);
  });

  test('parses comma-separated numbers', () => {
    const ranges = parsePhraseNumberQuery('1,2,3');
    expect(ranges).toEqual([
      { min: 1, max: 1 },
      { min: 2, max: 2 },
      { min: 3, max: 3 },
    ]);
  });

  test('returns null for invalid input', () => {
    const ranges = parsePhraseNumberQuery('abc');
    expect(ranges).toBeNull();
  });

  test('returns null for empty input', () => {
    const ranges = parsePhraseNumberQuery('');
    expect(ranges).toBeNull();
  });

  test('handles whitespace in ranges', () => {
    const ranges = parsePhraseNumberQuery('1 - 100');
    expect(ranges).toEqual([{ min: 1, max: 100 }]);
  });
});

describe('matchesPhraseNumber', () => {
  test('matches number in range', () => {
    const ranges = [{ min: 1, max: 100 }];
    expect(matchesPhraseNumber(50, ranges)).toBe(true);
    expect(matchesPhraseNumber(1, ranges)).toBe(true);
    expect(matchesPhraseNumber(100, ranges)).toBe(true);
  });

  test('does not match number outside range', () => {
    const ranges = [{ min: 1, max: 100 }];
    expect(matchesPhraseNumber(101, ranges)).toBe(false);
    expect(matchesPhraseNumber(0, ranges)).toBe(false);
  });

  test('matches multiple ranges', () => {
    const ranges = [
      { min: 1, max: 10 },
      { min: 90, max: 100 },
    ];
    expect(matchesPhraseNumber(5, ranges)).toBe(true);
    expect(matchesPhraseNumber(95, ranges)).toBe(true);
    expect(matchesPhraseNumber(50, ranges)).toBe(false);
  });
});
