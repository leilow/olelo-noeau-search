'use client';

import { Phrase } from '@/lib/types/database';
import Tag from './Tag';
import { highlightSearchTerms } from '@/lib/search/searchUtils';
import tagCategoryMap from '@/data/tag-category-map.json';
import { useState, memo, useEffect, useRef, useCallback } from 'react';
import EditModal from './EditModal';
import CopyToast from './CopyToast';

interface PhraseCardProps {
  phrase: Phrase;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  searchQuery?: string;
  isSearchPage?: boolean;
  onTagClick?: (tag: string) => void;
}

function PhraseCard({ phrase, isFavorite = false, onToggleFavorite, searchQuery, isSearchPage = false, onTagClick }: PhraseCardProps) {
  const [showAllTags, setShowAllTags] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldLinkHeadword = phrase.headword_link && 
    phrase.headword_link !== phrase.source_link;

  // Prioritize tags by category for search page (show one from each category, then fill to minimum of 3)
  const getPrioritizedTags = (tags: string[], maxTags: number, minTags: number = 3): { displayTags: string[]; hasMore: boolean } => {
    if (!isSearchPage || tags.length <= maxTags) {
      return { displayTags: tags, hasMore: false };
    }

    const tagMap = tagCategoryMap as Record<string, string>;
    const categoryGroups: Record<string, string[]> = {};
    const uncategorized: string[] = [];

    // Group tags by category
    tags.forEach(tag => {
      const category = tagMap[tag];
      if (category) {
        if (!categoryGroups[category]) {
          categoryGroups[category] = [];
        }
        categoryGroups[category].push(tag);
      } else {
        uncategorized.push(tag);
      }
    });

    // Prioritize: one tag from each category (for visual variety/color diversity)
    const displayTags: string[] = [];
    const categories = Object.keys(categoryGroups);
    
    // Sort categories deterministically but prioritize diversity
    // Use a stable sort based on category name to ensure consistent selection
    const sortedCategories = [...categories].sort();
    
    // Add one tag from each category first (for visual variety)
    // Prioritize shorter tags within each category to help fit on one line
    sortedCategories.forEach(category => {
      if (displayTags.length < maxTags && categoryGroups[category].length > 0) {
        // Sort tags in this category by length (shortest first) and take the shortest
        const sortedByLength = [...categoryGroups[category]].sort((a, b) => a.length - b.length);
        displayTags.push(sortedByLength[0]);
      }
    });

    // Fill remaining slots to reach minimum, prioritizing shorter tags (for single-line display)
    // This ensures we always show at least minTags if available
    const targetCount = Math.min(maxTags, Math.max(minTags, tags.length));
    
    // Collect all remaining tags (not yet displayed), sorted by length (shortest first)
    const remainingTags: string[] = [];
    
    // Add remaining tags from categories (prioritize shorter ones)
    sortedCategories.forEach(category => {
      const availableFromCategory = categoryGroups[category].filter(t => !displayTags.includes(t));
      // Sort by length (shortest first) to prioritize shorter tags
      availableFromCategory.sort((a, b) => a.length - b.length);
      remainingTags.push(...availableFromCategory);
    });
    
    // Add uncategorized tags (also sorted by length)
    const unusedUncategorized = uncategorized.filter(t => !displayTags.includes(t));
    unusedUncategorized.sort((a, b) => a.length - b.length);
    remainingTags.push(...unusedUncategorized);
    
    // Sort all remaining tags by length (shortest first) to prioritize shorter tags
    remainingTags.sort((a, b) => a.length - b.length);
    
    // Fill remaining slots with shortest available tags
    while (displayTags.length < targetCount && remainingTags.length > 0) {
      displayTags.push(remainingTags.shift()!);
    }

    return {
      displayTags,
      hasMore: tags.length > displayTags.length
    };
  };

  const { displayTags, hasMore } = phrase.tags && phrase.tags.length > 0
    ? getPrioritizedTags(phrase.tags, 3)
    : { displayTags: [], hasMore: false };
  
  const tagsToShow = showAllTags ? phrase.tags : displayTags;

  // Format text for copying with attribution
  const formatCopyText = useCallback((): string => {
    const tagMap = tagCategoryMap as Record<string, string>;
    const categories = new Set<string>();
    
    // Get all unique categories from tags
    if (phrase.tags) {
      phrase.tags.forEach(tag => {
        const category = tagMap[tag];
        if (category) {
          categories.add(category);
        }
      });
    }

    // Capitalize categories
    const capitalizedCategories = Array.from(categories).map(cat => 
      cat.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    ).sort();

    const sortedTags = phrase.tags ? [...phrase.tags].sort() : [];

    let text = `#${phrase.phrase_numbers}\n\n`;
    text += `${phrase.hawaiian_phrase}\n`;
    
    if (phrase.english_phrase) {
      text += `${phrase.english_phrase}\n`;
    }
    
    if (phrase.meaning_phrase) {
      text += `${phrase.meaning_phrase}\n`;
    }
    
    if (capitalizedCategories.length > 0) {
      text += `\nCategories: ${capitalizedCategories.join(', ')}\n`;
    }
    
    if (sortedTags.length > 0) {
      text += `Tags: ${sortedTags.map(t => t.toLowerCase()).join(', ')}\n`;
    }
    
    text += `\nSource: ${phrase.source_link || phrase.headword_link || 'N/A'}\n`;
    text += `\nFrom: ʻŌlelo Noʻeau Search (olelonoeau.com)`;

    return text;
  }, [phrase]);

  // Handle copy event
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0) return;
      
      // Check if the selection is within this card
      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      
      if (cardRef.current && anchorNode && focusNode && 
          (cardRef.current.contains(anchorNode) || cardRef.current.contains(focusNode))) {
        // User is copying text from this card - intercept and add attribution
        e.preventDefault();
        const formattedText = formatCopyText();
        e.clipboardData?.setData('text/plain', formattedText);
        setShowCopyToast(true);
      }
    };

    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, [formatCopyText]);

  return (
    <div ref={cardRef} className="bg-card border border-button/30 rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-text/70">#{phrase.phrase_numbers}</span>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="link-text text-xs hover:underline"
            style={{ color: '#5a4f3f' }}
          >
            edit
          </button>
        </div>
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className="text-lg hover:scale-110 transition-transform"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '⭐' : '☆'}
          </button>
        )}
      </div>
      
      <div className="font-body space-y-1">
        <p 
          className="text-lg"
          dangerouslySetInnerHTML={{
            __html: searchQuery && searchQuery.length >= 2
              ? highlightSearchTerms(phrase.hawaiian_phrase, searchQuery)
              : phrase.hawaiian_phrase
          }}
        />
        {phrase.english_phrase && (
          <p 
            className="italic text-text/80"
            dangerouslySetInnerHTML={{
              __html: searchQuery && searchQuery.length >= 2
                ? highlightSearchTerms(phrase.english_phrase, searchQuery)
                : phrase.english_phrase
            }}
          />
        )}
        {phrase.meaning_phrase && (
          <p 
            className="text-text/90"
            dangerouslySetInnerHTML={{
              __html: searchQuery && searchQuery.length >= 2
                ? highlightSearchTerms(phrase.meaning_phrase, searchQuery)
                : phrase.meaning_phrase
            }}
          />
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 items-center pt-2">
        {phrase.headword_label && (
          <span className="link-text">
            {shouldLinkHeadword ? (
              <a 
                href={phrase.headword_link!} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {phrase.headword_label.charAt(0).toUpperCase() + phrase.headword_label.slice(1)}
              </a>
            ) : (
              <span>{phrase.headword_label.charAt(0).toUpperCase() + phrase.headword_label.slice(1)}</span>
            )}
          </span>
        )}
        {phrase.headword_label && phrase.source_link && phrase.source_link !== phrase.headword_link && (
          <span className="text-text/60">|</span>
        )}
        {phrase.source_link && phrase.source_link !== phrase.headword_link && (
          <span className="link-text">
            <a 
              href={phrase.source_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Source
            </a>
          </span>
        )}
      </div>
      
      {phrase.tags && phrase.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center pt-2">
          {tagsToShow.map((tag, idx) => (
            <Tag 
              key={idx} 
              tag={tag}
              onTagClick={onTagClick}
            />
          ))}
          {hasMore && !showAllTags && (
            <button
              onClick={() => setShowAllTags(true)}
              className="tag-link text-text"
              style={{ backgroundColor: '#faedcd' }}
            >
              More Tags
            </button>
          )}
          {showAllTags && hasMore && (
            <button
              onClick={() => setShowAllTags(false)}
              className="tag-link text-text"
              style={{ backgroundColor: '#faedcd' }}
            >
              Less Tags
            </button>
          )}
        </div>
      )}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        phraseNumber={phrase.phrase_numbers}
      />
      <CopyToast
        isVisible={showCopyToast}
        onClose={() => setShowCopyToast(false)}
      />
    </div>
  );
}

export default memo(PhraseCard);
