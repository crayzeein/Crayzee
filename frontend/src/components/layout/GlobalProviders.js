'use client';
import CartToast from '@/components/ui/CartToast';
import WishlistToast from '@/components/ui/WishlistToast';
import VisitorTracker from '@/components/analytics/VisitorTracker';

export default function GlobalProviders({ children }) {
  return (
    <>
      <VisitorTracker />
      {children}
      <CartToast />
      <WishlistToast />
    </>
  );
}
