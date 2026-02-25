'use client';
import { Suspense } from 'react';
import DiscoveryView from '@/components/product/DiscoveryView';

function SearchContent() {
  return <DiscoveryView isSearch={true} />;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
