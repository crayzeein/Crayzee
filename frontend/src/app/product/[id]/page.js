'use client';
import { useEffect, useState, use } from 'react';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/layout/Navbar';
import API from '@/utils/api';
import { ShoppingCart, Heart, Share2, Star, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import BrandLoader from '@/components/ui/BrandLoader';

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
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
      <BrandLoader size="lg" />
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
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <div className="w-full max-w-[1920px] mx-auto pt-24 pb-20" style={{ paddingLeft: 'clamp(16px, 4vw, 64px)', paddingRight: 'clamp(16px, 4vw, 64px)' }}>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 mb-16">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
          >
            <div className="aspect-[3/4] overflow-hidden rounded-2xl relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
              {(product.images?.[0]?.url || product.image) ? (
                <Image
                  src={product.images?.[0]?.url || product.image}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={product.name}
                  fill
                  priority
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 font-semibold text-sm">
                  No Image Available
                </div>
              )}
            </div>
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">{product.subCategory || 'CRAYZEE'}</span>
            </div>
          </motion.div>

          {/* Product Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            {product.rating > 0 && (
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={product.rating >= s ? '#fb5607' : 'none'} className={product.rating >= s ? 'text-[#fb5607]' : 'text-zinc-200 dark:text-zinc-700'} />)}
                </div>
                <span className="text-[11px] font-semibold text-zinc-400 ml-1">{product.rating.toFixed(1)} ({product.numReviews} reviews)</span>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 leading-tight tracking-tight text-zinc-900 dark:text-white capitalize">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-2xl sm:text-3xl font-bold text-[#fb5607]">₹{product.price}</span>
            </div>

            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mb-6">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-3">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-xl font-semibold text-sm flex items-center justify-center transition-all border ${selectedSize === size
                      ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-3">Quantity</label>
              {product.stock > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center font-bold text-lg hover:text-[#fb5607] transition-colors disabled:opacity-20">-</button>
                    <span className="w-10 text-center font-bold">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}
                      className="w-10 h-10 flex items-center justify-center font-bold text-lg hover:text-[#fb5607] transition-colors disabled:opacity-20">+</button>
                  </div>
                  {product.stock <= 5 && <span className="text-[10px] font-semibold text-red-500">Only {product.stock} left!</span>}
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-4 py-3 rounded-xl">
                  <p className="text-red-500 font-semibold text-xs">Currently Out of Stock</p>
                </div>
              )}
            </div>
            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
              <button onClick={() => addToCart(product, quantity, selectedSize)} disabled={product.stock === 0}
                className="flex-1 h-[48px] bg-[#fb5607] text-white rounded-xl font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 hover:bg-[#e04e06] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <ShoppingCart size={16} /> {product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}
              </button>
              <button onClick={() => toggleWishlist(product)}
                className={`h-[48px] w-[48px] shrink-0 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${isWishlisted ? 'bg-red-50 dark:bg-red-500/10 border-[#fb5607] text-[#fb5607]' : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:border-[#fb5607] hover:text-[#fb5607]'}`}>
                <Heart size={18} className={isWishlisted ? 'fill-[#fb5607]' : ''} />
              </button>
            </div>
            <button onClick={handleShare}
              className="flex items-center gap-2 text-zinc-400 hover:text-[#fb5607] transition-colors text-[11px] font-medium">
              <Share2 size={13} /> Share this product
            </button>
          </motion.div>
        </div>

        {/* Rating and Reviews Section */}
        <section className="mt-12 pt-10 border-t border-zinc-200 dark:border-zinc-800">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Submit Rating */}
            <div className="lg:col-span-1">
              <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">Rate this product</h3>
              <p className="text-zinc-400 text-sm mb-6">Share your experience with other shoppers.</p>

              <div className="space-y-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Customer Reviews</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fb5607]/8 rounded-lg">
                  <Star size={12} fill="#fb5607" stroke="none" />
                  <span className="text-[11px] font-semibold text-[#fb5607]">
                    {product.rating?.toFixed(1) || 0} ({product.numReviews || 0})
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review, idx) => (
                    <div key={idx} className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#fb5607] flex items-center justify-center font-bold text-white text-xs">
                            {review.name[0]}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">{review.name}</h4>
                            <p className="text-[10px] text-zinc-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={10} fill={review.rating >= s ? '#fb5607' : 'none'} className={review.rating >= s ? 'text-[#fb5607]' : 'text-zinc-200'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                        {review.comment || "Great product!"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <p className="text-zinc-400 text-sm font-medium mb-1">No reviews yet</p>
                    <p className="text-[11px] text-zinc-400">Be the first to review this product!</p>
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
