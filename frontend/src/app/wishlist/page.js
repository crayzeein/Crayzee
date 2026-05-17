'use client';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/product/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WishlistPage() {
  const { wishlist, user, _hasHydrated } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && !user) {
      router.push('/login?redirect=/wishlist');
    }
  }, [user, router, _hasHydrated]);

  if (!_hasHydrated || !user) return null;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <div className="w-full max-w-[1920px] mx-auto pt-24 pb-20" style={{ paddingLeft: 'clamp(16px, 4vw, 64px)', paddingRight: 'clamp(16px, 4vw, 64px)' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">My Wishlist</h1>
            <p className="text-[12px] text-zinc-400 mt-1">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
          </div>
          {wishlist.length > 0 && (
            <Link href="/browse" className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-500 hover:text-[#fb5607] transition-colors">
              Continue Shopping <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-12 sm:p-16 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800">
            <div className="w-16 h-16 bg-[#fb5607]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Heart size={28} className="text-[#fb5607]" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">Your wishlist is empty</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">Save the items you love by tapping the heart icon on any product.</p>
            <Link href="/browse" className="inline-block bg-[#fb5607] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#e04e06] transition-all">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {wishlist.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
