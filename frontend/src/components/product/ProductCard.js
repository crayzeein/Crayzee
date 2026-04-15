'use client';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const isWishlisted = wishlist.find(item => item._id === product._id);

  // Capitalize first letter of each word to avoid ALL CAPS look
  const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white dark:bg-zinc-900 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-transparent dark:border-white/5 hover:border-zinc-200 dark:hover:border-zinc-700"
    >
      {/* Product Image Section */}
      <Link href={`/product/${product._id}`} className="block relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-800/80 cursor-pointer">
        {(product.images?.[0]?.url || product.image) ? (
          <Image
            src={product.images?.[0]?.url || product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-bold tracking-widest uppercase">
            NO IMAGE
          </div>
        )}

        {/* Top Left Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.subCategory && (
            <span className="bg-white/95 backdrop-blur-sm text-zinc-800 px-2.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase shadow-sm">
              {product.subCategory}
            </span>
          )}
          {product.stock === 0 ? (
            <span className="bg-red-500/95 text-white px-2.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase shadow-sm">Sold Out</span>
          ) : product.stock < 5 ? (
            <span className="bg-amber-500/95 text-white px-2.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase shadow-sm">Few Left</span>
          ) : null}
        </div>

        {/* Rating overlay Bottom Left */}
        {product.rating > 0 && (
          <div className="absolute bottom-2 left-2 bg-white/95 dark:bg-black/80 px-2 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
            <span className="text-yellow-500 text-[11px] leading-none">★</span>
            <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-100 leading-none mr-0.5">{product.rating.toFixed(1)}</span>
          </div>
        )}
        
        {/* Hover Quick Add to Bag */}
        {product.stock > 0 && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
             <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1); }}
                className="w-full bg-white/95 dark:bg-black/95 backdrop-blur-md py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-white hover:bg-[#fb5607] hover:text-white transition-colors flex items-center justify-center gap-2"
             >
                <ShoppingBag size={14} /> ADD TO BAG
             </button>
          </div>
        )}
      </Link>

      {/* Product Information Section */}
      <div className="p-3.5 pb-4">
        {/* Brand & Wishlist */}
        <div className="flex justify-between items-start mb-1 text-zinc-500 dark:text-zinc-400">
          <p className="text-[11px] font-bold uppercase tracking-wide">
            Crayzee®
          </p>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
            className={`transition-colors -mt-1 -mr-1 p-1 z-20 relative ${isWishlisted ? 'text-[#fb5607]' : 'hover:text-[#fb5607]'}`}
          >
            <Heart size={16} className={isWishlisted ? 'fill-[#fb5607]' : ''} />
          </button>
        </div>
        
        {/* Product Title */}
        <Link href={`/product/${product._id}`}>
          <h3 className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-tight mb-2 line-clamp-1 group-hover:text-[#fb5607] transition-colors">
            {toTitleCase(product.name)}
          </h3>
        </Link>

        {/* Price & Discount */}
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            ₹{product.price}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-[10px] sm:text-xs text-zinc-400 line-through">₹{product.originalPrice}</span>
              <span className="text-[10px] sm:text-xs font-bold text-[#00b852]">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
