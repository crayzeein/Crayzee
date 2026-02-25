'use client';
import { Suspense } from 'react';
import DiscoveryView from '@/components/product/DiscoveryView';

function BrowseContent() {
  return <DiscoveryView />;
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
