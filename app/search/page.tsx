'use client';

import SearchResultsContent from '@/components/user/SearchResultsContent';
import { Suspense } from 'react';

export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="flex-1 p-6">Loading search results...</div>}
    >
      <SearchResultsContent />
    </Suspense>
  );
}
