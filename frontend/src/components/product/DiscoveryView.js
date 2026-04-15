'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/product/ProductCard';
import API from '@/utils/api';
import { SlidersHorizontal, ChevronDown, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

function DiscoveryContent({
  initialCategory = 'clothing',
  initialGender = 'all',
  initialSubCategory = 'all',
  title: propTitle = '',
  isSearch = false
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeMainCat, activeGender, activeSubCat, setCategory } = useStore();

  const query = searchParams.get('q') || searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || initialCategory;
  const urlGender = searchParams.get('gender') || initialGender;
  const urlSubCat = searchParams.get('subCategory') || initialSubCategory;

  useEffect(() => {
    if (urlCategory || urlGender || urlSubCat) {
      setCategory(urlCategory, urlGender, urlSubCat);
    }
  }, [urlCategory, urlGender, urlSubCat, setCategory]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [minRating, setMinRating] = useState(Number(searchParams.get('rating')) || 0);
  const [selectedSizes, setSelectedSizes] = useState(
    searchParams.get('sizes') ? searchParams.get('sizes').split(',') : []
  );
  const [showFilters, setShowFilters] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    sizes: true,
    rating: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Popularity' },
    { value: 'priceLow', label: 'Price: Low to High' },
    { value: 'priceHigh', label: 'Price: High to Low' },
    { value: 'oldest', label: 'Oldest First' }
  ];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (sort !== 'newest') params.set('sort', sort); else params.delete('sort');
      if (minRating) params.set('rating', minRating); else params.delete('rating');
      if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(',')); else params.delete('sizes');
      const newQuery = params.toString();
      const currentQuery = searchParams.toString();
      if (newQuery !== currentQuery) {
        router.push(`?${newQuery}`, { scroll: false });
      }
    }, 600);
    return () => clearTimeout(timeoutId);
  }, [sort, minRating, selectedSizes, router, searchParams]);

  const sizesOptions = ['S', 'M', 'L', 'XL', 'XXL'];

  // Clean casing helper
  const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getDynamicTitle = () => {
    if (isSearch) return `Search Results for "${query}"`;
    let genderLabel = '';
    let subCatLabel = '';
    if (activeGender && activeGender !== 'all') genderLabel = toTitleCase(activeGender);
    if (activeSubCat && activeSubCat !== 'all') subCatLabel = toTitleCase(activeSubCat);
    
    if (genderLabel && subCatLabel) return `${genderLabel}'s ${subCatLabel}`;
    if (genderLabel) return `${genderLabel}'s Collection`;
    if (subCatLabel) return `${subCatLabel} Collection`;
    return 'All Products';
  };

  useEffect(() => {
    let ignore = false;
    const fetchProducts = async () => {
      setLoading(true);
      // We no longer clear products immediately to prevent layout jumps
      try {
        let url = `/products?page=${page}&limit=12&sort=${sort}`;
        if (query) url += `&search=${encodeURIComponent(query)}`;
        if (activeMainCat && activeMainCat !== 'all') url += `&category=${encodeURIComponent(activeMainCat)}`;
        if (activeGender && activeGender !== 'all') url += `&gender=${encodeURIComponent(activeGender)}`;
        if (activeSubCat && activeSubCat !== 'all') url += `&subCategory=${encodeURIComponent(activeSubCat)}`;
        if (minRating) url += `&rating=${minRating}`;
        if (selectedSizes.length > 0) url += `&sizes=${selectedSizes.join(',')}`;

        const [apiResponse] = await Promise.all([
          API.get(url),
          page === 1 ? new Promise(resolve => setTimeout(resolve, 1500)) : Promise.resolve()
        ]);
        const { data } = apiResponse;
        if (ignore) return;

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
        if (!ignore) setLoading(false);
      }
    };
    fetchProducts();
    return () => { ignore = true; };
  }, [query, activeMainCat, activeGender, activeSubCat, sort, minRating, selectedSizes, page]);

  useEffect(() => {
    setPage(1);
  }, [query, activeMainCat, activeGender, activeSubCat, sort, minRating, selectedSizes]);

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const activeFilterCount = [
    minRating > 0, selectedSizes.length > 0
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setMinRating(0);
    setSelectedSizes([]);
  };

  const FilterContent = () => (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg overflow-hidden">
      {/* Sizes Block */}
      <div className="border-b border-zinc-100 dark:border-zinc-800">
        <button 
          onClick={() => toggleSection('sizes')}
          className="w-full flex items-center justify-between p-4 focus:outline-none"
        >
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Sizes</h3>
          <ChevronDown size={16} className={`text-zinc-500 transition-transform duration-300 ${openSections.sizes ? 'rotate-180' : ''}`} />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.sizes ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-4 flex flex-wrap gap-2">
            {sizesOptions.map(size => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${selectedSizes.includes(size)
                  ? 'bg-[#fb5607] border-[#fb5607] text-white'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-[#fb5607] hover:text-[#fb5607]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Rating Block */}
      <div>
        <button 
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between p-4 focus:outline-none"
        >
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Rating</h3>
          <ChevronDown size={16} className={`text-zinc-500 transition-transform duration-300 ${openSections.rating ? 'rotate-180' : ''}`} />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSections.rating ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-4 flex flex-col gap-2.5">
            {[4, 3, 2, 1].map(stars => (
              <div key={stars} onClick={() => setMinRating(minRating === stars ? 0 : stars)} className="flex items-center gap-3 cursor-pointer group py-0.5">
                 <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${minRating === stars ? 'border-[#fb5607]' : 'border-zinc-300 dark:border-zinc-700 group-hover:border-[#fb5607]'}`}>
                   {minRating === stars && <div className="w-2 h-2 rounded-full bg-[#fb5607]" />}
                 </div>
                 <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                   {stars} <span className="text-yellow-400">★</span> & Above
                 </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Navbar />
      <div className="pt-6 md:pt-8 pb-20 w-full max-w-[1920px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
        
        {/* Breadcrumb row */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-8 overflow-x-auto whitespace-nowrap no-scrollbar p-1">
            <a href="/" className="hover:text-[#fb5607] transition-colors">Home</a>
            {!isSearch && (
              <>
                <ChevronRight size={12} className="text-zinc-300" />
                <span>{toTitleCase(activeMainCat === 'all' ? 'Products' : activeMainCat)}</span>
                
                {activeGender !== 'all' && (
                  <>
                    <ChevronRight size={12} className="text-zinc-300" />
                    <span>{toTitleCase(activeGender)}</span>
                  </>
                )}
                {activeSubCat !== 'all' && (
                  <>
                    <ChevronRight size={12} className="text-zinc-300" />
                    <span className="text-zinc-900 dark:text-white font-medium">{toTitleCase(activeSubCat)}</span>
                  </>
                )}
              </>
            )}
        </div>

        {/* ===== MOBILE: Sticky Filter + Sort Bar (Amazon/Flipkart style) ===== */}
        <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 -mx-4 px-4 mb-4">
          <div className="flex">
            <button
              onClick={() => { setShowFilters(!showFilters); setIsSortOpen(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-r border-zinc-200 dark:border-zinc-800 transition-colors ${showFilters ? 'text-[#fb5607]' : 'text-zinc-700 dark:text-zinc-300'}`}
            >
              <SlidersHorizontal size={16} />
              Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </button>
            <button
              onClick={() => { setIsSortOpen(!isSortOpen); setShowFilters(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${isSortOpen ? 'text-[#fb5607]' : 'text-zinc-700 dark:text-zinc-300'}`}
            >
              <ChevronDown size={16} className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              Sort by
            </button>
          </div>
        </div>

        {/* MOBILE: Filter Bottom Sheet */}
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-2xl max-h-[70vh] overflow-y-auto shadow-2xl"
              >
                <div className="sticky top-0 bg-white dark:bg-zinc-900 flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">Filters</h3>
                  <div className="flex items-center gap-4">
                    {activeFilterCount > 0 && (
                      <button onClick={clearAllFilters} className="text-xs text-[#fb5607] font-semibold">Clear All</button>
                    )}
                    <button onClick={() => setShowFilters(false)} className="text-zinc-400 font-bold text-lg">✕</button>
                  </div>
                </div>
                <div className="p-4">
                  <FilterContent />
                </div>
                <div className="sticky bottom-0 p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                  <button onClick={() => setShowFilters(false)} className="w-full bg-[#fb5607] text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wider">
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MOBILE: Sort Bottom Sheet */}
        <AnimatePresence>
          {isSortOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSortOpen(false)}
                className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-2xl shadow-2xl"
              >
                <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">Sort by</h3>
                  <button onClick={() => setIsSortOpen(false)} className="text-zinc-400 font-bold text-lg">✕</button>
                </div>
                <div className="py-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { setSort(option.value); setIsSortOpen(false); }}
                      className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-all ${sort === option.value
                        ? 'text-[#fb5607] font-bold bg-[#fb5607]/5'
                        : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {option.label}
                      {sort === option.value && <Check size={16} className="text-[#fb5607]" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Display Wrapper for Sidebar + Content Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative min-h-[400px]">
          <AnimatePresence>
            {loading && products.length > 0 && page === 1 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-start justify-center pt-32 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-[2px] rounded-xl"
              >
                <div className="bg-white shadow-xl rounded-2xl p-2 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="48" height="48">
                    <rect width="200" height="200" rx="36" fill="#111111"/>
                    <path d="M 135 30 A 78 78 0 1 0 135 170 L 135 150 A 58 58 0 1 1 135 50 Z" fill="white"/>
                    <circle cx="140" cy="34" r="10" fill="white"/>
                    <circle cx="140" cy="34" r="6" fill="#111111"/>
                    <path d="M 113 46 L 71 112 L 103 112 L 77 156 L 133 98 L 99 98 L 123 46 Z" fill="#FF4800"/>
                    <line x1="77" y1="156" x2="69" y2="175" stroke="#FF4800" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* ====== LEFT SIDEBAR (Filters - Desktop only) ====== */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0 lg:sticky top-32 z-10">
            <div className="flex items-center justify-between mb-4 mt-2">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</h2>
              {(activeFilterCount > 0) && (
                <button onClick={clearAllFilters} className="text-sm text-[#fb5607] font-semibold hover:underline">
                  Clear All
                </button>
              )}
            </div>
            <div className="max-h-[calc(100vh-140px)] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
               <FilterContent />
            </div>
          </aside>

          {/* ====== RIGHT MAIN CONTENT (Products) ====== */}
          <div className="flex-1 w-full relative">
            
            {/* Title & Actions Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800/50 gap-3">
              <h1 className="text-lg sm:text-xl md:text-[22px] font-bold flex items-baseline gap-2 sm:gap-3 text-zinc-900 dark:text-white leading-none">
                {propTitle || getDynamicTitle()}
                <span className="text-xs sm:text-sm font-medium text-zinc-500">{total} Products</span>
              </h1>

              {/* Sort By Dropdown - DESKTOP ONLY */}
              <div className="relative group hidden lg:block">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  onBlur={() => setTimeout(() => setIsSortOpen(false), 200)}
                  className="flex items-center justify-between gap-3 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded-lg text-sm font-medium hover:border-zinc-300 dark:hover:border-zinc-700 transition-all w-[240px] cursor-pointer bg-white dark:bg-zinc-900"
                >
                  <span className="text-zinc-500">Sort by : <span className="text-zinc-900 dark:text-white font-bold ml-1">{sortOptions.find(o => o.value === sort)?.label || 'Newest'}</span></span>
                  <ChevronDown size={16} className={`text-zinc-400 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-[240px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden z-50 py-1"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSort(option.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-all ${sort === option.value
                            ? 'text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-800/50 font-bold'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Dynamic rendering of products grid */}
            <div className="relative min-h-[400px]">

              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-16">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>

                  {total > products.length && !loading && (
                    <div className="flex justify-center mb-16">
                      <button onClick={() => setPage(prev => prev + 1)} className="border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 px-10 py-3 rounded-lg text-sm font-bold transition-all uppercase tracking-wider">
                        Load More Products
                      </button>
                    </div>
                  )}
                </>
              ) : (
                !loading && (
                  <div className="py-24 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-16">
                    <div className="text-4xl mb-4 opacity-50">🔍</div>
                    <h3 className="text-lg font-bold mb-2 text-zinc-900 dark:text-white">No Products Found</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">We couldn't find any products matching your current filters. Try adjusting them.</p>
                    {(activeFilterCount > 0) && (
                      <button onClick={clearAllFilters} className="bg-[#fb5607] hover:bg-[#e04e06] text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-all">
                        Clear All Filters
                      </button>
                    )}
                  </div>
                )
              )}

              {/* Loading placeholder cards when fully loading initial view */}
              {loading && products.length === 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-16">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-lg" />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

export default function DiscoveryView(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-zinc-950" />}>
      <DiscoveryContent {...props} />
    </Suspense>
  );
}
