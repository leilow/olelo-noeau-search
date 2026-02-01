import { Suspense } from 'react';
import { fetchAllPhrases } from '@/lib/phrases/fetchPhrases';
import SearchPageContent from '@/components/search/SearchPageContent';

export default async function SearchPage() {
  const initialAllPhrases = await fetchAllPhrases();
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading...</p>
        </div>
      }
    >
      <SearchPageContent initialAllPhrases={initialAllPhrases} />
    </Suspense>
  );
}
