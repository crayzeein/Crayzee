'use client';
import { useEffect, useState, use } from 'react';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/product/ProductCard';
import API from '@/utils/api';
import { ShoppingCart, Heart, Share2, Star, ChevronDown, ChevronRight, Truck, Shield, RotateCcw, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import BrandLoader from '@/components/ui/BrandLoader';

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [openAccordion, setOpenAccordion] = useState('details');
  const { addToCart, toggleWishlist, wishlist, user } = useStore();

  const isWishlisted = wishlist.find(item => item._id === id);

  // Review state
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
        setActiveImageIndex(0);
        setQuantity(1);

        // Set default size
        const sizes = data.sizes && data.sizes.length > 0 ? data.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
        setSelectedSize(sizes.includes('M') ? 'M' : sizes[0]);

        // Pre-fill if user already reviewed
        if (user && data.reviews) {
          const existing = data.reviews.find(r => r.user === user._id || r.user?._id === user._id);
          if (existing) {
            setUserRating(existing.rating);
            setUserComment(existing.comment || '');
          } else {
            setUserRating(0);
            setUserComment('');
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

  // Fetch similar products
  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const { data } = await API.get(`/products/${id}/similar`);
        setSimilarProducts(data || []);
      } catch (error) {
        console.error('Error fetching similar:', error);
      }
    };
    if (id) fetchSimilar();
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${product.name} on Crayzee!`,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const submitReview = async () => {
    if (!user) {
      alert('Please login to leave a review.');
      return;
    }
    if (userRating === 0) {
      alert('Please select a rating!');
      return;
    }
    setSubmittingReview(true);
    try {
      const response = await API.post(`/products/${id}/reviews`, {
        rating: userRating,
        comment: userComment
      });
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);
      alert(response.data.message || 'Review submitted!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <BrandLoader size="lg" />
    </div>
  );

  if (!product) return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <div className="pt-32 text-center">
        <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">Product not found</h2>
        <Link href="/browse" className="inline-block bg-[#fb5607] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#e04e06] transition-all">
          Back to Shop
        </Link>
      </div>
    </main>
  );

  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
  const images = product.images && product.images.length > 0 ? product.images : [];
  const mainImage = images[activeImageIndex]?.url || product.image || '';

  // Rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => {
    const count = product.reviews ? product.reviews.filter(r => r.rating === star).length : 0;
    const percent = product.numReviews > 0 ? (count / product.numReviews) * 100 : 0;
    return { star, count, percent };
  });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <div className="w-full max-w-[1920px] mx-auto pt-20 sm:pt-24 pb-24 sm:pb-20" style={{ paddingLeft: 'clamp(12px, 4vw, 64px)', paddingRight: 'clamp(12px, 4vw, 64px)' }}>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mb-4 overflow-x-auto whitespace-nowrap no-scrollbar">
          <Link href="/" className="hover:text-[#fb5607] transition-colors">Home</Link>
          <ChevronRight size={9} className="text-zinc-300" />
          <Link href={`/${product.gender}`} className="hover:text-[#fb5607] transition-colors capitalize">{product.gender}</Link>
          {product.subCategory && (<>
            <ChevronRight size={9} className="text-zinc-300" />
            <span className="text-zinc-500 font-medium capitalize">{product.subCategory}</span>
          </>)}
        </div>

        {/* MAIN PRODUCT SECTION */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mb-16">

          {/* LEFT: Image Gallery */}
          <div className="w-full lg:w-[55%] xl:w-[58%]">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              {/* Thumbnails — side on desktop, bottom on mobile */}
              {images.length > 1 && (
                <div className="flex sm:flex-col gap-2 sm:w-[72px] shrink-0 overflow-x-auto sm:overflow-y-auto sm:max-h-[600px] no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-20 sm:w-[72px] sm:h-[88px] shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx ? 'border-[#fb5607] ring-1 ring-[#fb5607]/30' : 'border-zinc-200 dark:border-zinc-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img.url} alt="" fill className="object-cover !relative" unoptimized />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="flex-1 aspect-[3/4] relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 group">
                {mainImage ? (
                  <Image
                    src={mainImage}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={product.name}
                    fill
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">No Image</div>
                )}
                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-zinc-900/85 text-white px-3 py-1 rounded-full text-[9px] font-medium tracking-wide uppercase backdrop-blur-sm">
                    {product.subCategory || 'CRAYZEE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info — Sticky on desktop */}
          <div className="w-full lg:w-[45%] xl:w-[42%]">
            <div className="lg:sticky lg:top-24">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

                {/* Rating */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded-md text-[11px] font-bold">
                      {product.rating.toFixed(1)} <Star size={10} fill="white" stroke="none" />
                    </div>
                    <span className="text-[11px] text-zinc-400">{product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'}</span>
                  </div>
                )}

                {/* Title */}
                <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold leading-tight tracking-tight text-zinc-900 dark:text-white capitalize mb-2">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-2xl sm:text-3xl font-bold text-[#fb5607]">₹{product.price}</span>
                  <span className="text-[11px] text-zinc-400 font-medium">Inclusive of all taxes</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-5" />

                {/* Size Selector */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Select Size</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] h-11 px-3 rounded-xl font-semibold text-sm flex items-center justify-center transition-all border ${selectedSize === size
                          ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-[#fb5607] hover:text-[#fb5607]'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block mb-3">Quantity</label>
                  {product.stock > 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}
                          className="w-10 h-10 flex items-center justify-center font-bold text-lg hover:text-[#fb5607] transition-colors disabled:opacity-20">−</button>
                        <span className="w-10 text-center font-bold text-sm">{quantity}</span>
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

                {/* Desktop Action Buttons */}
                <div className="hidden sm:flex gap-3 mb-5">
                  <button onClick={() => addToCart(product, quantity, selectedSize)} disabled={product.stock === 0}
                    className="flex-1 h-[50px] bg-[#fb5607] text-white rounded-xl font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 hover:bg-[#e04e06] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <ShoppingCart size={16} /> {product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}
                  </button>
                  <button onClick={() => toggleWishlist(product)}
                    className={`h-[50px] w-[50px] shrink-0 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${isWishlisted ? 'bg-red-50 dark:bg-red-500/10 border-[#fb5607] text-[#fb5607]' : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:border-[#fb5607] hover:text-[#fb5607]'}`}>
                    <Heart size={18} className={isWishlisted ? 'fill-[#fb5607]' : ''} />
                  </button>
                </div>

                {/* Share */}
                <button onClick={handleShare}
                  className="hidden sm:flex items-center gap-2 text-zinc-400 hover:text-[#fb5607] transition-colors text-[11px] font-medium mb-6">
                  <Share2 size={13} /> Share this product
                </button>

                {/* Divider */}
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-5" />

                {/* USP Strip */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { icon: <Truck size={16} />, label: 'Free Delivery', sub: 'Above ₹1500' },
                    { icon: <RotateCcw size={16} />, label: 'Easy Returns', sub: '7 day policy' },
                    { icon: <Shield size={16} />, label: 'Secure Pay', sub: '100% safe' },
                  ].map((usp, i) => (
                    <div key={i} className="text-center p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                      <div className="text-[#fb5607] flex justify-center mb-1.5">{usp.icon}</div>
                      <p className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">{usp.label}</p>
                      <p className="text-[9px] text-zinc-400">{usp.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Accordion Info Sections */}
                <div className="space-y-1">
                  {[
                    { key: 'details', title: 'Product Details', content: product.description },
                    { key: 'shipping', title: 'Shipping & Returns', content: 'Free shipping on orders above ₹1500. Standard delivery takes 3-5 business days. Easy 7-day return policy — no questions asked. Items must be unused with tags attached.' },
                    { key: 'care', title: 'Care Instructions', content: 'Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron on low heat if needed. Do not dry clean.' },
                  ].map((section) => (
                    <div key={section.key} className="border-b border-zinc-100 dark:border-zinc-800">
                      <button
                        onClick={() => setOpenAccordion(openAccordion === section.key ? '' : section.key)}
                        className="w-full flex items-center justify-between py-3.5 text-left"
                      >
                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{section.title}</span>
                        <ChevronDown size={16} className={`text-zinc-400 transition-transform duration-300 ${openAccordion === section.key ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {openAccordion === section.key && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed pb-4">{section.content}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

              </motion.div>
            </div>
          </div>
        </div>

        {/* RATINGS & REVIEWS SECTION */}
        <section className="mb-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-6">Ratings & Reviews</h2>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Rating Summary */}
            <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-4 mb-5">
                <div className="text-center">
                  <div className="text-4xl font-bold text-zinc-900 dark:text-white">{product.rating?.toFixed(1) || '0.0'}</div>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={product.rating >= s ? '#fb5607' : 'none'} className={product.rating >= s ? 'text-[#fb5607]' : 'text-zinc-200 dark:text-zinc-700'} />)}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">{product.numReviews || 0} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {ratingBreakdown.map(({ star, count, percent }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-zinc-400 w-3">{star}</span>
                      <Star size={9} className="text-zinc-300" fill="currentColor" />
                      <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#fb5607] rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-[9px] text-zinc-400 w-5 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Write Review */}
            <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Rate this product</h3>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-all"
                  >
                    <Star size={28} fill={(hoverRating || userRating) >= star ? '#fb5607' : 'none'}
                      className={(hoverRating || userRating) >= star ? 'text-[#fb5607]' : 'text-zinc-200 dark:text-zinc-700'}
                      strokeWidth={2} />
                  </button>
                ))}
              </div>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Write your review (optional)..."
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm focus:border-[#fb5607] focus:ring-1 focus:ring-[#fb5607] outline-none min-h-[80px] resize-none transition-all text-zinc-900 dark:text-white"
              />
              <button
                onClick={submitReview}
                disabled={submittingReview}
                className="w-full mt-3 bg-[#fb5607] text-white py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider hover:bg-[#e04e06] transition-all disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 max-h-[400px] overflow-y-auto no-scrollbar">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4">Customer Reviews</h3>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review, idx) => (
                    <div key={idx} className="pb-4 border-b border-zinc-50 dark:border-zinc-800 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#fb5607]/10 flex items-center justify-center font-bold text-[#fb5607] text-xs">
                            {review.name?.[0] || 'U'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs text-zinc-900 dark:text-white">{review.name}</h4>
                            <p className="text-[9px] text-zinc-400">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 bg-green-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
                          {review.rating} <Star size={7} fill="white" stroke="none" />
                        </div>
                      </div>
                      {review.comment && <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-zinc-400 text-sm mb-1">No reviews yet</p>
                  <p className="text-[11px] text-zinc-400">Be the first to review!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SIMILAR PRODUCTS SECTION */}
        {similarProducts.length > 0 && (
          <section className="pt-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">You Might Also Like</h2>
              <span className="text-[11px] text-zinc-400 font-medium">{similarProducts.length} products</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
              {similarProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => toggleWishlist(product)}
          className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl border transition-all ${isWishlisted ? 'bg-red-50 dark:bg-red-500/10 border-[#fb5607] text-[#fb5607]' : 'border-zinc-200 dark:border-zinc-700 text-zinc-400'}`}>
          <Heart size={18} className={isWishlisted ? 'fill-[#fb5607]' : ''} />
        </button>
        <button onClick={() => addToCart(product, quantity, selectedSize)} disabled={product.stock === 0}
          className="flex-1 h-11 bg-[#fb5607] text-white rounded-xl font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#e04e06] active:scale-[0.98] transition-all disabled:opacity-50">
          <ShoppingCart size={15} /> {product.stock > 0 ? `Add to Bag · ₹${product.price}` : 'Out of Stock'}
        </button>
        <button onClick={handleShare}
          className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-400">
          <Share2 size={16} />
        </button>
      </div>
    </main>
  );
}
