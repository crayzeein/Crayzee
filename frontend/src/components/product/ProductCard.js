'use client';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const isWishlisted = wishlist.find(item => item._id === product._id);

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group relative overflow-hidden bg-white dark:bg-zinc-950 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-shadow duration-300"
    >
      {/* Image */}
      <Link href={`/product/${product._id}`} className="block relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-900 cursor-pointer">
        {(product.images?.[0]?.url || product.image) ? (
          <Image
            src={product.images?.[0]?.url || product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px] font-medium tracking-widest uppercase">
            NO IMAGE
          </div>
        )}

        {/* Wishlist - Top Right */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
          className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isWishlisted
              ? 'bg-[#fb5607] text-white'
              : 'bg-white/80 dark:bg-black/60 backdrop-blur-sm text-zinc-400 hover:text-[#fb5607]'
          }`}
        >
          <Heart size={14} className={isWishlisted ? 'fill-white' : ''} strokeWidth={2} />
        </button>

        {/* Badges - Top Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.subCategory && (
            <span className="bg-zinc-900/85 text-white px-2.5 py-[3px] rounded-full text-[9px] font-medium tracking-wide uppercase backdrop-blur-sm">
              {product.subCategory}
            </span>
          )}
          {product.stock === 0 ? (
            <span className="bg-red-500/90 text-white px-2.5 py-[3px] rounded-full text-[9px] font-medium tracking-wide uppercase">Sold Out</span>
          ) : product.stock < 5 ? (
            <span className="bg-amber-500/90 text-white px-2.5 py-[3px] rounded-full text-[9px] font-medium tracking-wide uppercase">Few Left</span>
          ) : null}
        </div>

        {/* Rating - Bottom Left */}
        {product.rating > 0 && (
          <div className="absolute bottom-2.5 left-2.5 bg-white/90 dark:bg-black/75 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 z-10">
            <span className="text-yellow-500 text-[10px]">★</span>
            <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-100">{product.rating.toFixed(1)}</span>
          </div>
        )}


      </Link>

      {/* Product Info */}
      <div className="px-1 pt-2.5 pb-3">
        <Link href={`/product/${product._id}`}>
          <h3 className="text-[12px] sm:text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 leading-snug mb-1.5 line-clamp-1 group-hover:text-[#fb5607] transition-colors">
            {toTitleCase(product.name)}
          </h3>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-bold text-[#fb5607]">
            ₹{product.price}
          </span>
          {discount > 0 && (
            <>
              <span className="text-[11px] text-zinc-400 line-through">₹{product.originalPrice}</span>
              <span className="text-[9px] font-semibold text-white bg-emerald-500 px-1.5 py-[1px] rounded">
                {discount}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
