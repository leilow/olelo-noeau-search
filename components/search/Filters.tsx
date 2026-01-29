'use client';

import { useState, useMemo } from 'react';
import tagCategoryMap from '@/data/tag-category-map.json';

const HAWAIIAN_LETTERS = ['a', 'e', 'i', 'o', 'u', 'h', 'k', 'l', 'm', 'n', 'p', 'w', 'ʻ'];
const ENGLISH_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

interface FiltersProps {
  hawaiianLetters: string[];
  englishLetters: string[];
  categories: string[];
  tags: string[];
  phraseNumber: string;
  searchQuery: string;
  availableCategories: string[];
  availableTags: string[];
  availableHawaiianLetters: string[];
  availableIndexLetters: string[];
  phraseNumberRange: { min: number; max: number } | null;
  onHawaiianLettersChange: (letters: string[]) => void;
  onEnglishLettersChange: (letters: string[]) => void;
  onCategoriesChange: (categories: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  onPhraseNumberChange: (value: string) => void;
  onClearAll: () => void;
}

export default function Filters({
  hawaiianLetters,
  englishLetters,
  categories,
  tags,
  phraseNumber,
  searchQuery,
  availableCategories,
  availableTags,
  availableHawaiianLetters,
  availableIndexLetters,
  phraseNumberRange,
  onHawaiianLettersChange,
  onEnglishLettersChange,
  onCategoriesChange,
  onTagsChange,
  onPhraseNumberChange,
  onClearAll,
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState({
    hawaiian: false,
    english: false,
    category: false,
    tags: false,
    phraseNumber: false,
  });
  const [tagSearch, setTagSearch] = useState('');

  const toggleHawaiian = (letter: string) => {
    if (hawaiianLetters.includes(letter)) {
      onHawaiianLettersChange(hawaiianLetters.filter(l => l !== letter));
    } else {
      onHawaiianLettersChange([...hawaiianLetters, letter]);
    }
  };

  const toggleEnglish = (letter: string) => {
    if (englishLetters.includes(letter)) {
      onEnglishLettersChange(englishLetters.filter(l => l !== letter));
    } else {
      onEnglishLettersChange([...englishLetters, letter]);
    }
  };

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      onCategoriesChange(categories.filter(c => c !== cat));
    } else {
      onCategoriesChange([...categories, cat]);
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter(t => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  // Helper to close all dropdowns except the one being toggled
  const openDropdown = (key: keyof typeof isOpen) => {
    const willBeOpen = !isOpen[key];
    setIsOpen({
      hawaiian: false,
      english: false,
      category: false,
      tags: false,
      phraseNumber: false,
      [key]: willBeOpen,
    });
    // Clear search inputs when closing dropdowns
    if (!willBeOpen) {
      if (key === 'tags') setTagSearch('');
    }
  };

  // Filter available tags based on selected categories AND index letters
  const filteredTags = useMemo(() => {
    let tags = availableTags;
    
    // First filter by category
    if (categories.length > 0) {
      const tagMap = tagCategoryMap as Record<string, string>;
      // Normalize selected categories to lowercase for comparison
      const normalizedCategories = categories.map(cat => 
        cat.split(' ').map(word => 
          word.charAt(0).toLowerCase() + word.slice(1).toLowerCase()
        ).join(' ')
      );

      tags = tags.filter(tag => {
        const tagCategory = tagMap[tag];
        if (!tagCategory) return false;
        // Normalize tag category to match format
        const normalizedTagCategory = tagCategory.split(' ').map(word => 
          word.charAt(0).toLowerCase() + word.slice(1).toLowerCase()
        ).join(' ');
        return normalizedCategories.includes(normalizedTagCategory);
      });
    }

    // Then filter by index letters (first letter of tag) - works independently like Hawaiian Alphabet
    if (englishLetters.length > 0) {
      tags = tags.filter(tag => {
        const firstLetter = tag.charAt(0).toLowerCase();
        return englishLetters.includes(firstLetter);
      });
    }

    // Finally filter by search query
    if (tagSearch.trim().length > 0) {
      const searchLower = tagSearch.toLowerCase();
      tags = tags.filter(tag => tag.toLowerCase().includes(searchLower));
    }

    return tags;
  }, [availableTags, categories, englishLetters, tagSearch]);


  return (
    <div className="space-y-4">
      {/* Relational Filters: Category, Index Search, Tags */}
      <div className="flex flex-wrap gap-2 sm:gap-4 justify-center px-2">
        {/* Hawaiian Alphabet */}
        <div className="relative">
          <button
            onClick={() => openDropdown('hawaiian')}
            className="bg-button px-4 py-2 rounded-none border-2 border-transparent flex items-center gap-2 font-mono text-sm text-text hover:bg-button transition-colors"
          >
            Hawaiian Alphabet
            {hawaiianLetters.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onHawaiianLettersChange([]);
                }}
                className="bg-highlight text-text px-2 py-1 rounded-full text-xs font-bold hover:bg-highlight/80 flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear Hawaiian Alphabet"
              >
                <span>{hawaiianLetters.length}</span>
                <span className="text-sm leading-none">×</span>
              </span>
            )}
            <span className="ml-auto">▼</span>
          </button>
          {isOpen.hawaiian && (
            <div className="absolute top-full mt-1 bg-card border border-button/30 rounded-none p-3 z-10 shadow-lg min-w-[200px]">
              <div className="flex flex-wrap gap-2">
                {[...HAWAIIAN_LETTERS]
                  .sort((a, b) => {
                    const aSelected = hawaiianLetters.includes(a);
                    const bSelected = hawaiianLetters.includes(b);
                    if (aSelected && !bSelected) return -1;
                    if (!aSelected && bSelected) return 1;
                    // Keep original order for Hawaiian letters (not alphabetical)
                    return HAWAIIAN_LETTERS.indexOf(a) - HAWAIIAN_LETTERS.indexOf(b);
                  })
                  .map(letter => {
                    const isAvailable = availableHawaiianLetters.length === 0 || availableHawaiianLetters.includes(letter.toLowerCase());
                    return (
                      <button
                        key={letter}
                        onClick={() => toggleHawaiian(letter)}
                        disabled={!isAvailable}
                        className={`px-3 py-1 rounded text-sm ${
                          !isAvailable
                            ? 'opacity-30 cursor-not-allowed bg-button'
                            : hawaiianLetters.includes(letter)
                            ? 'bg-highlight font-bold'
                            : 'bg-button hover:bg-button/80'
                        }`}
                      >
                        {letter === 'ʻ' ? letter : letter.toUpperCase()}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Category */}
        <div className="relative">
          <button
            onClick={() => openDropdown('category')}
            className="bg-button px-4 py-2 rounded-none border-2 border-transparent flex items-center gap-2 font-mono text-sm text-text hover:bg-button transition-colors"
          >
            Category
            {categories.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoriesChange([]);
                }}
                className="bg-highlight text-text px-2 py-1 rounded-full text-xs font-bold hover:bg-highlight/80 flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear Category"
              >
                <span>{categories.length}</span>
                <span className="text-sm leading-none">×</span>
              </span>
            )}
            <span className="ml-auto">▼</span>
          </button>
          {isOpen.category && (
            <div className="absolute top-full mt-1 bg-card border border-button/30 rounded-none p-3 z-10 shadow-lg min-w-[200px] max-h-[300px] overflow-y-auto" onMouseEnter={(e) => e.stopPropagation()}>
              <div className="space-y-1">
                {[...availableCategories]
                  .sort((a, b) => {
                    const aSelected = categories.includes(a);
                    const bSelected = categories.includes(b);
                    if (aSelected && !bSelected) return -1;
                    if (!aSelected && bSelected) return 1;
                    return a.localeCompare(b);
                  })
                  .map(cat => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`w-full text-left px-3 py-1 rounded-none text-sm ${
                        categories.includes(cat)
                          ? 'bg-highlight font-bold'
                          : 'bg-button hover:bg-button/80'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Index Search - works like Hawaiian Alphabet, filters tags by first letter */}
        <div className="relative">
          <button
            onClick={() => openDropdown('english')}
            className="bg-button px-4 py-2 rounded-none border-2 border-transparent flex items-center gap-2 font-mono text-sm text-text hover:bg-button transition-colors"
          >
            Index Search
            {englishLetters.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onEnglishLettersChange([]);
                }}
                className="bg-highlight text-text px-2 py-1 rounded-full text-xs font-bold hover:bg-highlight/80 flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear Index Search"
              >
                <span>{englishLetters.length}</span>
                <span className="text-sm leading-none">×</span>
              </span>
            )}
            <span className="ml-auto">▼</span>
          </button>
          {isOpen.english && (
            <div className="absolute top-full mt-1 bg-card border border-button/30 rounded-none p-3 z-10 shadow-lg min-w-[200px]">
              <div className="flex flex-wrap gap-2">
                {[...ENGLISH_LETTERS]
                  .sort((a, b) => {
                    const aSelected = englishLetters.includes(a);
                    const bSelected = englishLetters.includes(b);
                    if (aSelected && !bSelected) return -1;
                    if (!aSelected && bSelected) return 1;
                    return a.localeCompare(b);
                  })
                  .map(letter => {
                    const isAvailable = availableIndexLetters.length === 0 || availableIndexLetters.includes(letter.toLowerCase());
                    return (
                      <button
                        key={letter}
                        onClick={() => toggleEnglish(letter)}
                        disabled={!isAvailable}
                        className={`px-3 py-1 rounded text-sm ${
                          !isAvailable
                            ? 'opacity-30 cursor-not-allowed bg-button'
                            : englishLetters.includes(letter)
                            ? 'bg-highlight font-bold'
                            : 'bg-button hover:bg-button/80'
                        }`}
                      >
                        {letter.toUpperCase()}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="relative">
          <button
            onClick={() => openDropdown('tags')}
            className="bg-button px-4 py-2 rounded-none border-2 border-transparent flex items-center gap-2 font-mono text-sm text-text hover:bg-button transition-colors"
          >
            Tags
            {tags.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onTagsChange([]);
                }}
                className="bg-highlight text-text px-2 py-1 rounded-full text-xs font-bold hover:bg-highlight/80 flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear Tags"
              >
                <span>{tags.length}</span>
                <span className="text-sm leading-none">×</span>
              </span>
            )}
            <span className="ml-auto">▼</span>
          </button>
          {isOpen.tags && (
            <div className="absolute top-full mt-1 bg-card border border-button/30 rounded-none p-3 z-10 shadow-lg min-w-[300px] max-h-[300px] overflow-y-auto" onMouseEnter={(e) => e.stopPropagation()}>
              <div className="space-y-2">
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder="Search tags..."
                  className="w-full bg-button border-2 border-transparent rounded-none px-3 py-2 font-mono text-sm text-text focus:outline-none focus:border-highlight transition-colors"
                  autoFocus
                />
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {filteredTags.length === 0 ? (
                    <div className="text-sm text-text/60 px-3 py-2">
                      {categories.length > 0 || tagSearch.trim().length > 0
                        ? 'No tags found'
                        : 'No tags available'}
                    </div>
                  ) : (
                    [...filteredTags]
                      .sort((a, b) => {
                        const aSelected = tags.includes(a);
                        const bSelected = tags.includes(b);
                        if (aSelected && !bSelected) return -1;
                        if (!aSelected && bSelected) return 1;
                        return a.localeCompare(b);
                      })
                      .slice(0, 100)
                      .map(tag => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`w-full text-left px-3 py-1 rounded text-sm ${
                              tags.includes(tag)
                                ? 'bg-highlight font-bold'
                                : 'bg-button hover:bg-button/80'
                            }`}
                          >
                            {tag.toLowerCase()}
                          </button>
                        ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Number (Phrase Number) */}
        <div className="relative">
          <button
            onClick={() => openDropdown('phraseNumber')}
            className="bg-button px-4 py-2 rounded-none border-2 border-transparent flex items-center gap-2 font-mono text-sm text-text hover:bg-button transition-colors"
          >
            Number
            {phraseNumber.trim().length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onPhraseNumberChange('');
                }}
                className="bg-highlight text-text px-2 py-1 rounded-full text-xs font-bold hover:bg-highlight/80 flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear Number"
              >
                <span>{phraseNumber}</span>
                <span className="text-sm leading-none">×</span>
              </span>
            )}
            <span className="ml-auto">▼</span>
          </button>
          {isOpen.phraseNumber && (
            <div className="absolute top-full mt-1 bg-card border border-button/30 rounded-none p-3 z-10 shadow-lg min-w-[280px]" onMouseEnter={(e) => e.stopPropagation()}>
              <div className="space-y-2">
                {phraseNumberRange && (
                  <div className="text-xs text-text/70 font-mono mb-2">
                    Range: {phraseNumberRange.min} - {phraseNumberRange.max}
                  </div>
                )}
                <input
                  type="text"
                  value={phraseNumber}
                  onChange={(e) => onPhraseNumberChange(e.target.value)}
                  placeholder="e.g., 100 or 1-100"
                  className="bg-button border-2 border-transparent rounded-none px-3 py-2 font-mono text-sm text-text focus:outline-none focus:border-highlight transition-colors w-full"
                  autoFocus
                />
                <div className="text-xs text-text/60 mt-1">
                  Enter a number (e.g., 100) or range (e.g., 1-100)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clear All */}
        {(hawaiianLetters.length > 0 || englishLetters.length > 0 || categories.length > 0 || tags.length > 0 || phraseNumber.trim().length > 0 || searchQuery.trim().length > 0) && (
          <button
            onClick={onClearAll}
            className="bg-button px-4 py-2 rounded-none border-2 border-transparent flex items-center gap-2 font-mono text-sm text-text hover:bg-button transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}
