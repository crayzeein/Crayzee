'use client';
import CartToast from '@/components/ui/CartToast';
import WishlistToast from '@/components/ui/WishlistToast';

export default function GlobalProviders({ children }) {
  return (
    <>
      {children}
      <CartToast />
      <WishlistToast />
    </>
  );
}
