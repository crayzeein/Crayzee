'use client';
import { Suspense } from 'react';
import DiscoveryView from '@/components/product/DiscoveryView';
import BrandLoader from '@/components/ui/BrandLoader';

export default function GiftsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950"><BrandLoader size="lg" /></div>}>
      <DiscoveryView initialMainCategory="Gifts" title="Gifts & Combos" />
    </Suspense>
  );
}
