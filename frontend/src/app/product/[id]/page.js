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
  const { addToCart, toggleWishlist, wishlist, user } = useStore();

  const isWishlisted = wishlist.find(item => item._id === id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);

        // If user already reviewed, pre-set the stars
        if (user && data.reviews) {
          const existingReview = data.reviews.find(r => r.user === user._id || r.user._id === user._id);
          if (existingReview) {
            setUserRating(existingReview.rating);
            setUserComment(existingReview.comment || '');
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, user]);

  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${product.name} on Crayzee!`,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You might want to use a toast here instead of alert
      alert('Link copied to clipboard! 🚀');
    }
  };

  const [selectedSize, setSelectedSize] = useState('M'); // Default to M

  const submitReview = async () => {
    if (!user) {
      alert('You need to be logged in to leave a vibe check! 🔒');
      return;
    }
    if (userRating === 0) {
      alert('Please select a rating! ⭐');
      return;
    }
    setSubmittingReview(true);
    try {
      const response = await API.post(`/products/${id}/reviews`, {
        rating: userRating,
        comment: userComment
      });
      // Refresh product data
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);
      alert(response.data.message || 'Review dropped! 🔥');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to drop review. Try again later.');
    } finally {
      setSubmittingReview(false);
    }
  };

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

  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <main className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-32 pb-20 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
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
                  unoptimized
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
              <span>{product.rating > 0 ? `${product.rating.toFixed(1)} RATING` : 'NO RATING YET'}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-6 leading-[0.9] tracking-tighter uppercase text-zinc-900 dark:text-white">
              {product.name}
            </h1>
            <div className="flex items-center gap-6 mb-8">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">₹{product.price}</span>
            </div>

            <p className="text-zinc-500 dark:text-zinc-300 text-lg mb-8 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mb-8">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#fb5607] block mb-4">Select Size</label>
              <div className="flex flex-wrap gap-3">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 rounded-2xl font-black text-sm flex items-center justify-center transition-all border-2 ${selectedSize === size
                      ? 'bg-[#fb5607] border-[#fb5607] text-white shadow-[0_0_20px_rgba(251,86,7,0.3)] scale-110'
                      : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/10 text-zinc-400 hover:border-[#fb5607] hover:text-[#fb5607]'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

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
                    {product.stock <= 5 && (
                      <div>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                          🔥 Only {product.stock} left in stock!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-500/10 border-2 border-red-100 dark:border-red-500/20 p-6 rounded-3xl">
                  <p className="text-red-500 dark:text-red-400 font-black uppercase text-xs tracking-widest">🚨 Currently Out of Stock</p>
                  <p className="text-[10px] font-bold text-red-400/80 uppercase tracking-widest mt-1">Check back soon for the next drop!</p>
                </div>
              )}
            </div>
            {/* Action Buttons - E-commerce style */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => addToCart(product, quantity, selectedSize)}
                disabled={product.stock === 0}
                className="flex-1 h-[52px] bg-[#fb5607] text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#e04e06] active:scale-[0.98] transition-all shadow-lg shadow-[#fb5607]/25 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} strokeWidth={2.5} />
                <span>{product.stock > 0 ? 'ADD TO BAG' : 'OUT OF STOCK'}</span>
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`h-[52px] w-[52px] shrink-0 flex items-center justify-center rounded-xl border-2 transition-all active:scale-95 ${isWishlisted ? 'bg-red-50 dark:bg-red-500/10 border-[#fb5607] text-[#fb5607]' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-[#fb5607] hover:text-[#fb5607]'}`}
              >
                <Heart size={20} className={isWishlisted ? 'fill-[#fb5607]' : ''} />
              </button>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 text-zinc-400 hover:text-[#fb5607] transition-colors text-[10px] font-bold uppercase tracking-widest mb-12"
            >
              <Share2 size={14} /> Share this product
            </button>
          </motion.div>
        </div>

        {/* Rating and Reviews Section */}
        <section className="mt-20 border-t border-zinc-100 dark:border-white/5 pt-20">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Submit Rating */}
            <div className="lg:col-span-1">
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-zinc-900 dark:text-white">Rate this Drop</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-widest mb-8">Let the world know if it's fire or mid.</p>

              <div className="space-y-6 bg-zinc-50 dark:bg-white/5 p-8 rounded-[32px] border border-zinc-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      className={`transition-all ${userRating >= star ? 'text-[#fb5607]' : 'text-zinc-300 dark:text-zinc-700 hover:text-[#fb5607]/50'}`}
                    >
                      <Star size={32} fill={userRating >= star ? 'currentColor' : 'none'} strokeWidth={3} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Drop a quick note (optional)..."
                  className="w-full bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#fb5607] outline-none min-h-[100px] resize-none"
                />
                <button
                  onClick={submitReview}
                  disabled={submittingReview}
                  className="w-full btn-primary py-4 text-xs tracking-[0.2em] font-black uppercase"
                >
                  {submittingReview ? 'SENDING...' : 'POST REVIEW'}
                </button>
              </div>
            </div>

            {/* List Reviews */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Community Vibe Checks</h3>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#fb5607]/10 rounded-full">
                  <Star size={14} fill="#fb5607" stroke="none" />
                  <span className="text-[10px] font-black text-[#fb5607] uppercase tracking-widest">
                    {product.rating?.toFixed(1) || 0} ({product.numReviews || 0} Reviews)
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review, idx) => (
                    <div key={idx} className="p-8 rounded-[32px] glass-card border border-zinc-100 dark:border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#fb5607] to-yellow-500 flex items-center justify-center font-black text-white text-xs">
                            {review.name[0]}
                          </div>
                          <div>
                            <h4 className="font-black text-sm uppercase text-zinc-900 dark:text-white">{review.name}</h4>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={10} fill={review.rating >= s ? '#fb5607' : 'none'} className={review.rating >= s ? 'text-[#fb5607]' : 'text-zinc-300'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed font-medium capitalize">
                        {review.comment || "Dropped a stellar rating! 🔥"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-zinc-50 dark:bg-white/5 rounded-[48px] border-2 border-dashed border-zinc-200 dark:border-white/10">
                    <p className="text-zinc-400 font-black uppercase tracking-widest text-xs mb-2">No reviews yet</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Be the first to check the vibe on this drop!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
