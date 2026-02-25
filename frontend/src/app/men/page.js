'use client';
import { Suspense } from 'react';
import DiscoveryView from '@/components/product/DiscoveryView';

export default function MenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DiscoveryView initialCategory="clothing" initialGender="men" title="Men's Collection" />
    </Suspense>
  );
}
