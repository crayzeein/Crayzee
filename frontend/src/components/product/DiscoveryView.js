'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/product/ProductCard';
import API from '@/utils/api';
import { SlidersHorizontal, ChevronDown, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

export default function DiscoveryView({
  initialCategory = 'clothing',
  initialGender = 'all',
  initialSubCategory = 'all',
  title: propTitle = '',
  isSearch = false
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeMainCat, activeGender, activeSubCat, setCategory } = useStore();

  // URL Params
  const query = searchParams.get('q') || searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || initialCategory;
  const urlGender = searchParams.get('gender') || initialGender;
  const urlSubCat = searchParams.get('subCategory') || initialSubCategory;

  // Sync URL params to global store
  useEffect(() => {
    if (urlCategory || urlGender || urlSubCat) {
      setCategory(urlCategory, urlGender, urlSubCat);
    }
  }, [urlCategory, urlGender, urlSubCat, setCategory]);

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state initialized from URL
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(Number(searchParams.get('rating')) || 0);
  const [selectedSizes, setSelectedSizes] = useState(
    searchParams.get('sizes') ? searchParams.get('sizes').split(',') : []
  );
  const [showFilters, setShowFilters] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Popularity' },
    { value: 'priceLow', label: 'Price: Low to High' },
    { value: 'priceHigh', label: 'Price: High to Low' },
    { value: 'oldest', label: 'Oldest First' }
  ];

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (sort !== 'newest') params.set('sort', sort); else params.delete('sort');
    if (minPrice) params.set('minPrice', minPrice); else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice); else params.delete('maxPrice');
    if (minRating) params.set('rating', minRating); else params.delete('rating');
    if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(',')); else params.delete('sizes');

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (newQuery !== currentQuery) {
      router.push(`?${newQuery}`, { scroll: false });
    }
  }, [sort, minPrice, maxPrice, minRating, selectedSizes, router, searchParams]);

  const sizesOptions = ['S', 'M', 'L', 'XL', 'XXL'];

  // Update Heading Logic
  const getDynamicTitle = () => {
    if (isSearch) return query;

    let titleParts = [];
    if (activeGender && activeGender !== 'all') titleParts.push(activeGender.toUpperCase());
    if (activeSubCat && activeSubCat !== 'all') titleParts.push(activeSubCat.toUpperCase());

    if (titleParts.length === 0) return 'THE COLLECTIVE';
    return `${titleParts.join("'S ")} COLLECTION`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      if (page === 1) setProducts([]);
      try {
        let url = `/products?page=${page}&limit=12&sort=${sort}`;

        if (query) url += `&search=${encodeURIComponent(query)}`;
        if (activeMainCat && activeMainCat !== 'all') url += `&category=${encodeURIComponent(activeMainCat)}`;
        if (activeGender && activeGender !== 'all') url += `&gender=${encodeURIComponent(activeGender)}`;
        if (activeSubCat && activeSubCat !== 'all') url += `&subCategory=${encodeURIComponent(activeSubCat)}`;

        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;
        if (minRating) url += `&rating=${minRating}`;
        if (selectedSizes.length > 0) url += `&sizes=${selectedSizes.join(',')}`;

        const { data } = await API.get(url);

        if (page === 1) {
          setProducts(data.products);
        } else {
          setProducts(prev => {
            const productMap = new Map();
            prev.forEach(p => productMap.set(p._id, p));
            data.products.forEach(p => productMap.set(p._id, p));
            return Array.from(productMap.values());
          });
        }

        setTotal(data.total);
        setTotalPages(data.pages);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, activeMainCat, activeGender, activeSubCat, sort, minPrice, maxPrice, minRating, selectedSizes, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, activeMainCat, activeGender, activeSubCat, sort, minPrice, maxPrice, minRating, selectedSizes]);

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Navbar />

      <div className="pt-32 pb-20 container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 text-[#fb5607] font-black uppercase tracking-[0.3em] text-[10px] mb-4">
            <span>Discovery Mode</span>
            {isSearch ? (
              <>
                <ChevronRight size={10} className="text-zinc-300" />
                <span>Search Results</span>
              </>
            ) : (
              <>
                {activeMainCat !== 'all' && (
                  <>
                    <ChevronRight size={10} className="text-zinc-300" />
                    <span>{activeMainCat}</span>
                  </>
                )}
                {activeGender !== 'all' && (
                  <>
                    <ChevronRight size={10} className="text-zinc-300" />
                    <span>{activeGender}</span>
                  </>
                )}
                {activeSubCat !== 'all' && (
                  <>
                    <ChevronRight size={10} className="text-zinc-300" />
                    <span>{activeSubCat}</span>
                  </>
                )}
              </>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-4 text-zinc-900 dark:text-white">
            {(() => {
              const fullTitle = propTitle || getDynamicTitle();
              const words = fullTitle.split(' ');
              if (words.length > 1) {
                return (
                  <>
                    <span className="text-zinc-900 dark:text-white">{words[0]} </span>
                    <span className="text-[#fb5607]">{words.slice(1).join(' ')}</span>
                  </>
                );
              }
              return fullTitle;
            })()}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs">
            Showing {total} unique drops found in the wild
          </p>
        </div>


        {/* Horizontal Subcategory Filter Tabs */}
        {activeMainCat === 'clothing' && activeGender !== 'all' && (
          <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-zinc-100 dark:border-white/5 overflow-x-auto no-scrollbar">
            {['all', 'oversized', 'graphic', 'anime'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (tab === 'all') params.delete('subCategory');
                  else params.set('subCategory', tab);
                  router.push(`?${params.toString()}`, { scroll: false });
                }}
                className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border-2 shrink-0 ${activeSubCat === tab
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-xl shadow-black/10'
                  : 'bg-white dark:bg-zinc-900 text-zinc-500 border-transparent hover:border-[#fb5607] hover:text-[#fb5607]'
                  }`}
              >
                {tab === 'all' ? `All ${activeGender}'s` : tab}
              </button>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-12 py-6 border-y border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Sort & Refine</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Custom Premium Sort Dropdown */}
            <div className="relative flex-1 md:flex-none">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center justify-between gap-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none hover:border-[#fb5607] transition-all w-full md:w-56 cursor-pointer text-zinc-900 dark:text-white group"
              >
                <span>{sortOptions.find(o => o.value === sort)?.label || 'Sort By'}</span>
                <ChevronDown
                  size={14}
                  className={`text-zinc-400 group-hover:text-[#fb5607] transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsSortOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden z-50 py-2"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSort(option.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all ${sort === option.value
                            ? 'text-[#fb5607] bg-zinc-50 dark:bg-white/5'
                            : 'text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5'
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl border transition-all duration-300 transform active:scale-95 ${showFilters
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white hover:border-[#fb5607] hover:text-[#fb5607] shadow-sm'
                }`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="p-10 bg-zinc-50 dark:bg-zinc-900 rounded-[48px] border border-zinc-100 dark:border-white/5 grid md:grid-cols-4 gap-12">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#fb5607]">Price Range</h4>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border-2 border-transparent px-4 py-3 rounded-2xl text-xs outline-none focus:border-[#fb5607]"
                    />
                    <span className="text-zinc-400">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border-2 border-transparent px-4 py-3 rounded-2xl text-xs outline-none focus:border-[#fb5607]"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#fb5607]">Select Sizes</h4>
                  <div className="flex flex-wrap gap-2">
                    {sizesOptions.map(size => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all border-2 ${selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-transparent hover:border-[#fb5607]'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#fb5607]">Minimum Rating</h4>
                  <div className="flex items-center gap-2">
                    {[4, 3, 2, 1].map(stars => (
                      <button
                        key={stars}
                        onClick={() => setMinRating(stars)}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all border-2 ${minRating === stars ? 'bg-[#fb5607] text-white border-[#fb5607]' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-transparent hover:border-[#fb5607]'}`}
                      >
                        {stars}+ ⭐
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end justify-end">
                  <button
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                      setMinRating(0);
                      setSelectedSizes([]);
                      setSort('newest');
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-all flex items-center gap-2 py-3"
                  >
                    <X size={14} /> Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}

              {loading && [...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-[40px]" />
              ))}
            </div>

            {/* Load More */}
            {total > products.length && !loading && (
              <div className="flex justify-center mb-20">
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  className="btn-primary px-12 py-5 rounded-full text-xs font-black tracking-widest uppercase hover:scale-105 transition-all"
                >
                  Load More Vibe
                </button>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="py-40 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-[48px] border border-zinc-100 dark:border-white/5 mb-20">
              <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter text-zinc-900 dark:text-white">Desert Vibes 🏜️</h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[10px] mb-10 max-w-sm mx-auto">No products available yet.</p>
              {(activeMainCat !== 'all' || activeGender !== 'all' || activeSubCat !== 'all') && (
                <button
                  onClick={() => setCategory('clothing', 'all', 'all')}
                  className="btn-primary"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )
        )}

        {loading && products.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-[40px]" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
