'use client';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CartToast() {
  const { cartToast, clearCartToast } = useStore();

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (cartToast) {
      const timer = setTimeout(() => clearCartToast(), 4000);
      return () => clearTimeout(timer);
    }
  }, [cartToast, clearCartToast]);

  return (
    <AnimatePresence>
      {cartToast && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-[999] sm:w-[380px]"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            {/* Success Header */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-500/10 border-b border-green-100 dark:border-green-500/20">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[12px] font-semibold text-green-700 dark:text-green-400 flex-1">Added to bag</span>
              <button onClick={clearCartToast} className="text-zinc-400 hover:text-zinc-600 transition-colors p-0.5">
                <X size={14} />
              </button>
            </div>

            {/* Product Info */}
            <div className="px-4 py-3 flex items-center gap-3">
              {cartToast.image && (
                <div className="w-12 h-14 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  <Image
                    src={cartToast.image}
                    alt={cartToast.name || ''}
                    width={48}
                    height={56}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-zinc-900 dark:text-white truncate capitalize">{cartToast.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {cartToast.size && (
                    <span className="text-[10px] text-zinc-400 font-medium">Size: {cartToast.size}</span>
                  )}
                  <span className="text-[10px] text-zinc-400 font-medium">Qty: {cartToast.qty}</span>
                </div>
              </div>
              <span className="text-[14px] font-bold text-zinc-900 dark:text-white shrink-0">₹{cartToast.price}</span>
            </div>

            {/* Action */}
            <div className="px-4 pb-3 flex gap-2">
              <Link
                href="/cart"
                onClick={clearCartToast}
                className="flex-1 py-2.5 bg-[#fb5607] text-white rounded-xl text-[12px] font-semibold text-center hover:bg-[#e04e06] transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} /> View Bag
              </Link>
              <button
                onClick={clearCartToast}
                className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-[12px] font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
