'use client';
import { Suspense } from 'react';
import DiscoveryView from '@/components/product/DiscoveryView';

export default function WomenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DiscoveryView initialCategory="clothing" initialGender="women" title="Women's Collection" />
    </Suspense>
  );
}
