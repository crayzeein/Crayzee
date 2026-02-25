'use client';
import { Suspense } from 'react';
import DiscoveryView from '@/components/product/DiscoveryView';

export default function MobileAccessoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DiscoveryView initialMainCategory="Mobile Accessories" title="Mobile Gear" />
    </Suspense>
  );
}
