'use client';
import { Heart, ShoppingBag, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const isWishlisted = wishlist.find(item => item._id === product._id);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -10 }}
      viewport={{ once: true }}
      className="group relative bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden hover:shadow-lg transition-all duration-300 border border-zinc-100 dark:border-white/5"
    >
      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {(product.images?.[0]?.url || product.image) ? (
          <Image
            src={product.images?.[0]?.url || product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 font-black uppercase text-[10px] tracking-widest">
            No Image
          </div>
        )}

        {/* Quick Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isFeatured && (
            <span className="bg-black text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">Featured</span>
          )}
          {product.stock === 0 ? (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">Sold Out</span>
          ) : product.stock < 5 ? (
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">Only {product.stock} left</span>
          ) : (
            <span className="bg-[#fb5607] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">New Drop</span>
          )}
        </div>

        {/* Wishlist Button - Top Right */}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all ${isWishlisted ? 'bg-[#fb5607] text-white' : 'glass text-zinc-900 dark:text-white hover:scale-110'}`}
        >
          <Heart size={16} className={isWishlisted ? 'fill-white' : ''} />
        </button>

        {/* Rapid Add to Cart - Bottom Left */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => { e.preventDefault(); if (product.stock > 0) addToCart(product, 1); }}
            disabled={product.stock === 0}
            className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl transition-all ${product.stock === 0
              ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-[#fb5607]'
              }`}
          >
            <ShoppingBag size={14} /> {product.stock === 0 ? 'Sold Out' : 'Instant Bag'}
          </button>
        </div>
      </div>

      {/* Product info */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{product.subCategory}</span>
        </div>
        <Link href={`/product/${product._id}`}>
          <h3 className="font-black text-base md:text-lg mb-1 leading-tight group-hover:text-[#fb5607] transition-colors truncate tracking-tighter uppercase text-zinc-900 dark:text-white">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex text-[#fb5607]">
            <span className="text-[10px] font-black">★</span>
          </div>
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            {product.rating > 0 ? `${product.rating.toFixed(1)} (${product.numReviews})` : 'No reviews'}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none">
            ₹{product.price}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
