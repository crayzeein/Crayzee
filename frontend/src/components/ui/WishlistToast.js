'use client';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function WishlistToast() {
  const { wishlistToast, clearWishlistToast } = useStore();

  useEffect(() => {
    if (wishlistToast) {
      const timer = setTimeout(() => clearWishlistToast(), 3500);
      return () => clearTimeout(timer);
    }
  }, [wishlistToast, clearWishlistToast]);

  return (
    <AnimatePresence>
      {wishlistToast && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-[999] sm:w-[360px]"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            {/* Header */}
            <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${
              wishlistToast.added
                ? 'bg-[#fb5607]/5 border-[#fb5607]/10'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700'
            }`}>
              <Heart
                size={16}
                className={wishlistToast.added ? 'text-[#fb5607] fill-[#fb5607]' : 'text-zinc-400'}
              />
              <span className={`text-[12px] font-semibold flex-1 ${
                wishlistToast.added ? 'text-[#fb5607]' : 'text-zinc-600 dark:text-zinc-300'
              }`}>
                {wishlistToast.added ? 'Added to wishlist' : 'Removed from wishlist'}
              </span>
              <button onClick={clearWishlistToast} className="text-zinc-400 hover:text-zinc-600 transition-colors p-0.5">
                <X size={14} />
              </button>
            </div>

            {/* Product Info */}
            <div className="px-4 py-3 flex items-center gap-3">
              {wishlistToast.image && (
                <div className="w-10 h-12 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  <Image
                    src={wishlistToast.image}
                    alt={wishlistToast.name || ''}
                    width={40}
                    height={48}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-zinc-900 dark:text-white truncate capitalize">{wishlistToast.name}</p>
                <p className="text-[12px] font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">₹{wishlistToast.price}</p>
              </div>
              {wishlistToast.added && (
                <Link
                  href="/wishlist"
                  onClick={clearWishlistToast}
                  className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-lg text-[11px] font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shrink-0"
                >
                  View
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
