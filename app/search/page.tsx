'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/search/SearchBar';
import Filters from '@/components/search/Filters';
import PhraseGrid from '@/components/phrase/PhraseGrid';
import PaginationControls from '@/components/search/PaginationControls';
import SearchHero from '@/components/search/SearchHero';
import ScrollToTopButton from '@/components/search/ScrollToTopButton';
import { Phrase } from '@/lib/types/database';
import tagCategoryMap from '@/data/tag-category-map.json';
import { searchPhrases } from '@/lib/search/searchUtils';
import { parsePhraseNumberQuery, matchesPhraseNumber } from '@/lib/search/numberSearch';

const PHRASES_PER_PAGE = 10;

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchPhrases>>([]);
  const [allPhrases, setAllPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [hawaiianLetters, setHawaiianLetters] = useState<string[]>(
    searchParams.get('hawaiian')?.split(',').filter(Boolean) || []
  );
  const [englishLetters, setEnglishLetters] = useState<string[]>(
    searchParams.get('english')?.split(',').filter(Boolean) || []
  );
  const [categories, setCategories] = useState<string[]>(
    searchParams.get('categories')?.split(',').filter(Boolean) || []
  );
  const [tags, setTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );
  const [phraseNumber, setPhraseNumber] = useState(
    searchParams.get('phraseNumber') || ''
  );

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableHawaiianLetters, setAvailableHawaiianLetters] = useState<string[]>([]);
  const [availableIndexLetters, setAvailableIndexLetters] = useState<string[]>([]);
  const [phraseNumberRange, setPhraseNumberRange] = useState<{ min: number; max: number } | null>(null);
  const [filteredCount, setFilteredCount] = useState(0);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Fetch all phrases on mount
  useEffect(() => {
    async function fetchPhrases() {
      try {
        const response = await fetch('/api/phrases');
        if (response.ok) {
          const data = await response.json();
          setAllPhrases(data);
          
          // Extract unique categories from tags and all unique tags
          const cats = new Set<string>();
          const tagSet = new Set<string>();
          const tagMap = tagCategoryMap as Record<string, string>;
          
          let minPhraseNum = Infinity;
          let maxPhraseNum = -Infinity;
          
          data.forEach((p: Phrase) => {
            // Track phrase number range
            if (p.phrase_numbers < minPhraseNum) minPhraseNum = p.phrase_numbers;
            if (p.phrase_numbers > maxPhraseNum) maxPhraseNum = p.phrase_numbers;
            
            if (p.tags) {
              p.tags.forEach(tag => {
                tagSet.add(tag);
                // Get category for this tag from the global mapping
                const tagCategory = tagMap[tag];
                if (tagCategory) {
                  cats.add(tagCategory);
                }
              });
            }
          });
          
          // Capitalize categories for display
          const capitalizedCategories = Array.from(cats).map(cat => {
            // Capitalize first letter of each word
            return cat.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
          }).sort();
          
          // Set initial values (will be updated when search/filters change)
          setAvailableCategories(capitalizedCategories);
          setAvailableTags(Array.from(tagSet).sort());
          
          // Extract Hawaiian letters from all phrases
          const hawaiianLetterSet = new Set<string>();
          data.forEach((p: Phrase) => {
            if (p.hawaiian_letter) {
              hawaiianLetterSet.add(p.hawaiian_letter.toLowerCase());
            }
          });
          setAvailableHawaiianLetters(Array.from(hawaiianLetterSet).sort());
          
          if (minPhraseNum !== Infinity && maxPhraseNum !== -Infinity) {
            setPhraseNumberRange({ min: minPhraseNum, max: maxPhraseNum });
          }
        }
      } catch (error) {
        console.error('Error fetching phrases:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPhrases();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== debouncedSearchQuery) {
        setCurrentPage(1); // Reset to first page on new search
      }
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  // Filter and paginate phrases
  useEffect(() => {
    let filtered = [...allPhrases];

    // Apply all filters first
    // Hawaiian letter filter
    if (hawaiianLetters.length > 0) {
      filtered = filtered.filter(p => 
        p.hawaiian_letter && hawaiianLetters.includes(p.hawaiian_letter.toLowerCase())
      );
    }

    // Index Search filter - filters phrases by tags starting with selected letters (works like Hawaiian Alphabet)
    // If category is selected, only filters within that category (relational)
    if (englishLetters.length > 0) {
      const tagMap = tagCategoryMap as Record<string, string>;
      filtered = filtered.filter(p => {
        // If phrase has no tags, don't filter it out (let main search handle it)
        if (!p.tags || p.tags.length === 0) return true;
        
        // Get tags to check based on category selection
        let tagsToCheck = p.tags;
        
        // If category is selected, only check tags from that category
        if (categories.length > 0) {
          const normalizedCategories = categories.map(cat => 
            cat.split(' ').map(word => 
              word.charAt(0).toLowerCase() + word.slice(1).toLowerCase()
            ).join(' ')
          );
          
          tagsToCheck = p.tags.filter(tag => {
            const tagCategory = tagMap[tag];
            if (!tagCategory) return false;
            const normalizedTagCategory = tagCategory.split(' ').map(word => 
              word.charAt(0).toLowerCase() + word.slice(1).toLowerCase()
            ).join(' ');
            return normalizedCategories.includes(normalizedTagCategory);
          });
          
          // If category is selected but no tags match the category, don't filter out
          // (let main search handle it if it matches other fields)
          if (tagsToCheck.length === 0) return true;
        }
        
        // Check if any tag starts with the selected index letters
        return tagsToCheck.some(tag => {
          const firstLetter = tag.charAt(0).toLowerCase();
          return englishLetters.includes(firstLetter);
        });
      });
    }

    // Category filter - check if phrase has tags from ALL selected categories (AND logic)
    // Note: categories in state are capitalized, but tagMap has lowercase, so we need to normalize
    if (categories.length > 0) {
      const tagMap = tagCategoryMap as Record<string, string>;
      // Normalize selected categories to lowercase for comparison
      const normalizedCategories = categories.map(cat => 
        cat.split(' ').map(word => 
          word.charAt(0).toLowerCase() + word.slice(1).toLowerCase()
        ).join(' ')
      );
      
      filtered = filtered.filter(p => {
        if (!p.tags || p.tags.length === 0) return false;
        // Check if phrase has tags from ALL selected categories (AND logic)
        // For each selected category, verify the phrase has at least one tag in that category
        return normalizedCategories.every(selectedCategory => {
          return p.tags!.some(tag => {
            const tagCategory = tagMap[tag];
            if (!tagCategory) return false;
            // Normalize tag category to match format
            const normalizedTagCategory = tagCategory.split(' ').map(word => 
              word.charAt(0).toLowerCase() + word.slice(1).toLowerCase()
            ).join(' ');
            return normalizedTagCategory === selectedCategory;
          });
        });
      });
    }

    // Tags filter - requires ALL selected tags to be present (AND logic)
    if (tags.length > 0) {
      filtered = filtered.filter(p => 
        p.tags && tags.every(tag => p.tags.includes(tag))
      );
    }

    // Phrase number filter (supports ranges like "1-100" or "1 to 100")
    if (phraseNumber.trim().length > 0) {
      const ranges = parsePhraseNumberQuery(phraseNumber);
      if (ranges) {
        filtered = filtered.filter(p => 
          matchesPhraseNumber(p.phrase_numbers, ranges)
        );
      } else {
        // Invalid query, show no results
        filtered = [];
      }
    }

    // Apply search with relevance ranking after all filters
    let resultsWithMetadata: ReturnType<typeof searchPhrases> = [];
    if (debouncedSearchQuery.length >= 2) {
      resultsWithMetadata = searchPhrases(filtered, debouncedSearchQuery);
      filtered = resultsWithMetadata.map(r => {
        const { relevanceScore, matchedFields, ...phrase } = r;
        return phrase;
      });
    } else {
      // Sort by phrase_numbers when no search
      filtered.sort((a, b) => a.phrase_numbers - b.phrase_numbers);
      resultsWithMetadata = filtered.map(p => ({ ...p, relevanceScore: 0, matchedFields: [] }));
    }

    // Update available filter options based on current search results
    // This makes filters relational to search - only show options that exist in search results
    const tagMap = tagCategoryMap as Record<string, string>;
    const cats = new Set<string>();
    const tagSet = new Set<string>();
    const hawaiianLetterSet = new Set<string>();
    const indexLetterSet = new Set<string>();

    // If tags are selected, only show categories that contain those tags
    const selectedTagCategories = new Set<string>();
    if (tags.length > 0) {
      tags.forEach(tag => {
        const tagCategory = tagMap[tag];
        if (tagCategory) {
          selectedTagCategories.add(tagCategory);
        }
      });
    }

    filtered.forEach((p: Phrase) => {
      // Track Hawaiian letters from search results
      if (p.hawaiian_letter) {
        hawaiianLetterSet.add(p.hawaiian_letter.toLowerCase());
      }

      // Track categories, tags, and index letters from search results
      if (p.tags) {
        p.tags.forEach(tag => {
          tagSet.add(tag);
          
          // Track index letters (first letter of tags) - like Hawaiian Alphabet
          const firstLetter = tag.charAt(0).toLowerCase();
          if (/[a-z]/.test(firstLetter)) {
            indexLetterSet.add(firstLetter);
          }
          
          const tagCategory = tagMap[tag];
          if (tagCategory) {
            // Filter categories based on:
            // 1. Selected tags (if any) - only show categories of selected tags
            // 2. Otherwise, show all categories from filtered results (phrases already match search)
            let shouldInclude = true;
            
            if (tags.length > 0 && !selectedTagCategories.has(tagCategory)) {
              shouldInclude = false;
            }
            
            // If no tags selected, show all categories from filtered results
            // (filtered already contains only phrases matching search/other filters)
            if (shouldInclude) {
              cats.add(tagCategory);
            }
          }
        });
      }
    });

    // Capitalize categories for display
    const capitalizedCategories = Array.from(cats).map(cat => {
      return cat.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }).sort();

    setAvailableCategories(capitalizedCategories);
    setAvailableTags(Array.from(tagSet).sort());
    setAvailableHawaiianLetters(Array.from(hawaiianLetterSet).sort());
    setAvailableIndexLetters(Array.from(indexLetterSet).sort());

    setSearchResults(resultsWithMetadata);
    setFilteredCount(filtered.length);

    // Paginate
    const total = Math.ceil(filtered.length / PHRASES_PER_PAGE);
    setTotalPages(total);
    const start = (currentPage - 1) * PHRASES_PER_PAGE;
    const end = start + PHRASES_PER_PAGE;
    setPhrases(filtered.slice(start, end));
  }, [allPhrases, debouncedSearchQuery, hawaiianLetters, englishLetters, categories, tags, phraseNumber, currentPage]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (hawaiianLetters.length > 0) params.set('hawaiian', hawaiianLetters.join(','));
    if (englishLetters.length > 0) params.set('english', englishLetters.join(','));
    if (categories.length > 0) params.set('categories', categories.join(','));
    if (tags.length > 0) params.set('tags', tags.join(','));
    if (phraseNumber.trim().length > 0) params.set('phraseNumber', phraseNumber.trim());
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [searchQuery, hawaiianLetters, englishLetters, categories, tags, phraseNumber, currentPage, router]);

  const handleClearAll = useCallback(() => {
    setSearchQuery('');
    setHawaiianLetters([]);
    setEnglishLetters([]);
    setCategories([]);
    setTags([]);
    setPhraseNumber('');
    setCurrentPage(1);
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    // Add tag to existing tags if not already selected
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      setCurrentPage(1); // Reset to page 1
    }
  }, [tags]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="space-y-6">
        <div id="search-bar-area" className="flex justify-center">
          <div className="w-full max-w-4xl">
            <SearchHero />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
        
        {loading && (
          <div className="text-center py-8">
            <p className="text-text/70">Loading phrases...</p>
          </div>
        )}
        
        <Filters
          hawaiianLetters={hawaiianLetters}
          englishLetters={englishLetters}
          categories={categories}
          tags={tags}
          phraseNumber={phraseNumber}
          searchQuery={searchQuery}
          availableCategories={availableCategories}
          availableTags={availableTags}
          availableHawaiianLetters={availableHawaiianLetters}
          availableIndexLetters={availableIndexLetters}
          phraseNumberRange={phraseNumberRange}
          onHawaiianLettersChange={setHawaiianLetters}
          onEnglishLettersChange={setEnglishLetters}
          onCategoriesChange={setCategories}
          onTagsChange={setTags}
          onPhraseNumberChange={setPhraseNumber}
          onClearAll={handleClearAll}
        />
        
        <div id="results-start" className="text-sm text-text/70 font-mono text-center">
          {debouncedSearchQuery ? (
            <>
              Showing {phrases.length} of {filteredCount} results for &quot;{debouncedSearchQuery}&quot;
              {filteredCount < allPhrases.length && ` (of ${allPhrases.length} total)`}
            </>
          ) : (
            <>Showing {phrases.length} of {filteredCount} phrases</>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
        
        <div className="flex justify-center">
          <PhraseGrid 
            phrases={phrases} 
            searchQuery={debouncedSearchQuery} 
            isSearchPage={true}
            onTagClick={handleTagClick}
          />
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
      <ScrollToTopButton />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Loading...</p>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
