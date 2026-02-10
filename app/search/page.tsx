import { Suspense } from 'react';
import { fetchAllPhrases } from '@/lib/phrases/fetchPhrases';
import SearchPageContent from '@/components/search/SearchPageContent';

async function SearchWithPhrases() {
  const initialAllPhrases = await fetchAllPhrases();
  return <SearchPageContent initialAllPhrases={initialAllPhrases} />;
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-text/70">Loading phrases...</p>
        </div>
      }
    >
      <SearchWithPhrases />
    </Suspense>
  );
}
