'use client';
import { useEffect, useState, use } from 'react';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/layout/Navbar';
import API from '@/utils/api';
import { ShoppingCart, Heart, Share2, Star, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleWishlist, wishlist } = useStore();

  const isWishlisted = wishlist.find(item => item._id === id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
      <div className="w-16 h-16 border-4 border-[#fb5607] border-t-transparent rounded-full animate-spin mb-6" />
      <p className="font-black uppercase tracking-[0.3em] text-[#fb5607] text-xs">Loading Vibes...</p>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
      <h2 className="text-8xl font-black mb-4 text-zinc-900 dark:text-white">404</h2>
      <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">Desert Vibes 🏜️ Drop Not Found</p>
    </div>
  );

  return (
    <main className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-32 pb-20 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative group"
          >
            <div className="aspect-[3/4] overflow-hidden rounded-[48px] soft-shadow border-4 border-white dark:border-zinc-800 relative bg-zinc-100 dark:bg-zinc-800">
              {(product.images?.[0]?.url || product.image) ? (
                <Image
                  src={product.images?.[0]?.url || product.image}
                  className="object-cover"
                  alt={product.name}
                  fill
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 font-black uppercase tracking-[0.2em] text-xs">
                  Missing Drop Visual
                </div>
              )}
            </div>
            {/* Quick Badges */}
            <div className="absolute top-8 left-8 flex flex-col gap-3">
              <span className="bg-[#fb5607] text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">HEAT DROP</span>
              <span className="bg-black text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg uppercase">100% CRAYZEE</span>
            </div>
          </motion.div>

          {/* Product Actions */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            <div className="flex items-center gap-2 mb-4 text-[#fb5607] font-black uppercase tracking-[0.3em] text-[10px]">
              <Star size={14} fill="currentColor" />
              <span>THE ELITE CHOICE</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter uppercase text-zinc-900 dark:text-white">
              {product.name}
            </h1>
            <div className="flex items-center gap-6 mb-8">
              <span className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">₹{product.price}</span>
              <span className="text-xl text-zinc-400 dark:text-zinc-500 line-through font-bold">₹{Math.round(product.price * 1.5)}</span>
              <span className="bg-[#fb5607]/10 text-[#fb5607] px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">50% OFF</span>
            </div>

            <p className="text-zinc-500 dark:text-zinc-300 text-lg mb-8 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div className="mb-10">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#fb5607] block mb-4">Select Quantity</label>
              {product.stock > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-zinc-100 dark:bg-white/5 p-2 rounded-2xl border border-zinc-200 dark:border-white/10">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center font-black text-xl hover:text-[#fb5607] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-black text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        className="w-10 h-10 flex items-center justify-center font-black text-xl hover:text-[#fb5607] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <div>
                      {product.stock <= 5 ? (
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                          🔥 Only {product.stock} left in stock!
                        </p>
                      ) : (
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                          In Stock ({product.stock} available)
                        </p>
                      )}
                    </div>
                  </div>
                  {quantity >= product.stock && product.stock > 0 && (
                    <p className="text-[10px] font-bold text-[#fb5607] uppercase tracking-widest">Maximum available stock reached</p>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 p-6 rounded-3xl">
                  <p className="text-red-500 dark:text-red-400 font-black uppercase text-xs tracking-widest">🚨 Currently Out of Stock</p>
                  <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest mt-1">Check back soon for the next drop!</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={product.stock === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-4 text-sm tracking-widest disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                <ShoppingCart size={22} strokeWidth={3} /> {product.stock > 0 ? 'ADD TO BAG' : 'OUT OF STOCK'}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-5 rounded-full glass transition-all ${isWishlisted ? 'text-[#fb5607] border-[#fb5607]' : 'text-zinc-900 dark:text-white hover:text-[#fb5607]'}`}
              >
                <Heart size={24} className={isWishlisted ? 'fill-[#fb5607]' : ''} />
              </button>
              <button className="p-5 rounded-full glass text-zinc-900 dark:text-white hover:text-[#fb5607] transition-all">
                <Share2 size={24} />
              </button>
            </div>

            {/* Product Details Tabs (Simplified) */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-zinc-900 dark:text-white group cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-[#fb5607]/10 transition-colors">
                  <MessageCircle size={22} className="text-[#fb5607]" />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-xs">Vibe Checks</h4>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{product.comments?.length || 0} Comments</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
