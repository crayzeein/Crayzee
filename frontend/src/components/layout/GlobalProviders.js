'use client';
import CartToast from '@/components/ui/CartToast';
import WishlistToast from '@/components/ui/WishlistToast';
import VisitorTracker from '@/components/analytics/VisitorTracker';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function GlobalProviders({ children }) {
  return (
    <>
      <VisitorTracker />
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      <CartToast />
      <WishlistToast />
    </>
  );
}
