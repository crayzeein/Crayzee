'use client';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/product/ProductCard';
import { Heart } from 'lucide-react';
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
      <div className="pt-32 pb-20 container mx-auto px-4">
        <header className="mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4 text-zinc-900 dark:text-white">
            YOUR <span className="text-[#fb5607]">WISHLIST</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm sm:text-base md:text-lg uppercase tracking-widest">Saved gear for future drops.</p>
        </header>

        {wishlist.length === 0 ? (
          <div className="py-16 sm:py-24 md:py-32 px-6 text-center bg-white dark:bg-zinc-900/50 rounded-[32px] md:rounded-[48px] border border-zinc-100 dark:border-white/5 shadow-xl">
            <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Heart size={40} className="text-[#fb5607] animate-pulse" fill="currentColor" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-4 uppercase tracking-tighter text-zinc-900 dark:text-white">Your wishlist is dry! 🏜️</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold mb-10 max-w-md mx-auto text-sm">Start hearting the products you love to keep track of them here.</p>
            <Link href="/browse" className="btn-primary inline-block">Browse Trendy Drops</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {wishlist.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
