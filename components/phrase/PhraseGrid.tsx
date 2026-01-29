import { Phrase } from '@/lib/types/database';
import PhraseCard from './PhraseCard';
import { memo } from 'react';

interface PhraseGridProps {
  phrases: Phrase[];
  favorites?: Set<number>;
  onToggleFavorite?: (phraseNumber: number) => void;
  searchQuery?: string;
  isSearchPage?: boolean;
  onTagClick?: (tag: string) => void;
}

function PhraseGrid({ phrases, favorites, onToggleFavorite, searchQuery, isSearchPage = false, onTagClick }: PhraseGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {phrases.map((phrase) => (
        <PhraseCard
          key={phrase.phrase_numbers}
          phrase={phrase}
          isFavorite={favorites?.has(phrase.phrase_numbers)}
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(phrase.phrase_numbers) : undefined}
          searchQuery={searchQuery}
          isSearchPage={isSearchPage}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
}

export default memo(PhraseGrid);
