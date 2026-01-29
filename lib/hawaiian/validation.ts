import { isValidHawaiianWord, normalizeOkina } from './diacritics';

/**
 * Validation utilities for Hawaiian language input
 */

export function validateHawaiianPhrase(phrase: string): {
  valid: boolean;
  error?: string;
} {
  if (!phrase || phrase.trim().length === 0) {
    return { valid: false, error: 'Phrase cannot be empty' };
  }

  // Normalize and check
  const normalized = normalizeOkina(phrase);
  if (!isValidHawaiianWord(normalized)) {
    return { valid: false, error: 'Contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Get English letter from phrase (first character)
 */
export function getEnglishLetter(phrase: string): string {
  const trimmed = phrase.trim();
  if (trimmed.length === 0) return '';
  const firstChar = trimmed[0].toLowerCase();
  // Regex: /[a-z]/
  // Matches: Single lowercase letter (a through z)
  // Purpose: Check if first character is an English letter
  return /[a-z]/.test(firstChar) ? firstChar : '';
}
