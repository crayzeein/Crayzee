'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/product/ProductCard';
import API from '@/utils/api';
import { SlidersHorizontal, ChevronDown, Check, ChevronRight, Star, ArrowDownUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import BrandLoader, { BrandLoaderOverlay } from '@/components/ui/BrandLoader';

// When no products are found, show popular products instead of a dead end
function NoResultsSection({ query, isSearch, clearAllFilters, activeFilterCount, activeSubCat }) {
  const [popular, setPopular] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const { data } = await API.get('/products?limit=12&sort=popular');
        setPopular(data.products || []);
      } catch (e) {
        console.error('Error fetching popular products:', e);
      } finally {
        setLoadingPopular(false);
      }
    };
    fetchPopular();
  }, []);

  const getMessage = () => {
    if (isSearch && query) {
      if (activeSubCat && activeSubCat !== 'all') {
        return `No results found for "${query}" in ${activeSubCat}`;
      } else if (activeFilterCount > 0) {
        return `No results found for "${query}" with your applied filters`;
      }
      return `We couldn't find results for "${query}"`;
    }
    return 'No products match your current filters';
  };

  return (
    <div className="mb-12">
      {/* Subtle message */}
      <div className="text-center mb-8">
        <p className="text-sm text-zinc-400 mb-3">
          {getMessage()}
        </p>
        {(activeFilterCount > 0 || (activeSubCat && activeSubCat !== 'all')) && (
          <button onClick={clearAllFilters} className="text-[#fb5607] text-xs font-semibold hover:underline">
            Clear all filters
          </button>
        )}
      </div>

      {/* Show popular products */}
      {popular.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Popular Right Now</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {popular.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </div>
      )}

      {loadingPopular && (
        <div className="flex items-center justify-center py-16">
          <BrandLoader size="md" />
        </div>
      )}
    </div>
  );
}

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
  const [openSections, setOpenSections] = useState({ sizes: true, rating: true });
  const [subCategories, setSubCategories] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);

  // Fetch subcategories directly from products
  const mainCat = activeMainCat || 'all';
  const gender = activeGender || 'all';
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const params = new URLSearchParams();
        if (mainCat && mainCat !== 'all') params.set('category', mainCat);
        if (gender && gender !== 'all') params.set('gender', gender);
        const { data } = await API.get(`/products/subcategories?${params.toString()}`);
        // Normalize: if API returns objects like {label, href}, extract label; if strings, keep as-is
        const normalized = (data || []).map(item => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object' && item.label) return item.label;
          return String(item);
        }).filter(s => s && s.trim() !== '');
        setSubCategories(normalized);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setSubCategories([]);
      }
    };
    fetchSubCategories();
  }, [mainCat, gender]);

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

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getDynamicTitle = () => {
    if (isSearch && query) return query;
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
        if (page === 1) { setProducts(data.products); }
        else {
          setProducts(prev => {
            const m = new Map();
            prev.forEach(p => m.set(p._id, p));
            data.products.forEach(p => m.set(p._id, p));
            return Array.from(m.values());
          });
        }
        setTotal(data.total);
        setTotalPages(data.pages);
      } catch (error) { console.error('Error fetching products:', error); }
      finally { if (!ignore) setLoading(false); }
    };
    fetchProducts();
    return () => { ignore = true; };
  }, [query, activeMainCat, activeGender, activeSubCat, sort, minRating, selectedSizes, page]);

  useEffect(() => { setPage(1); }, [query, activeMainCat, activeGender, activeSubCat, sort, minRating, selectedSizes]);

  const toggleSize = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const [draftMinRating, setDraftMinRating] = useState(minRating);
  const [draftSelectedSizes, setDraftSelectedSizes] = useState(selectedSizes);

  useEffect(() => {
    if (showFilters) {
      setDraftMinRating(minRating);
      setDraftSelectedSizes(selectedSizes);
    }
  }, [showFilters, minRating, selectedSizes]);

  const toggleDraftSize = (size) => {
    setDraftSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const activeFilterCount = [minRating > 0, selectedSizes.length > 0].filter(Boolean).length;
  const draftFilterCount = [draftMinRating > 0, draftSelectedSizes.length > 0].filter(Boolean).length;
  
  const clearAllFilters = () => { setMinRating(0); setSelectedSizes([]); };
  const clearDraftFilters = () => { setDraftMinRating(0); setDraftSelectedSizes([]); };

  const FilterContent = ({ currentRating, setRating, currentSizes, toggleSizeHandler }) => (
    <div className="space-y-5">
      <div>
        <button onClick={() => toggleSection('sizes')} className="w-full flex items-center justify-between mb-3 focus:outline-none">
          <h3 className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-[0.2em]">Sizes</h3>
          <ChevronDown size={13} className={`text-zinc-400 transition-transform duration-300 ${openSections.sizes ? 'rotate-180' : ''}`} />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${openSections.sizes ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-wrap gap-2">
            {sizesOptions.map(size => (
              <button key={size} onClick={() => toggleSizeHandler(size)}
                className={`w-10 h-10 rounded-lg text-[11px] font-semibold border transition-all duration-200 flex items-center justify-center ${currentSizes.includes(size)
                  ? 'bg-[#fb5607] border-[#fb5607] text-white' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400'}`}>
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
      <div>
        <button onClick={() => toggleSection('rating')} className="w-full flex items-center justify-between mb-3 focus:outline-none">
          <h3 className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-[0.2em]">Rating</h3>
          <ChevronDown size={13} className={`text-zinc-400 transition-transform duration-300 ${openSections.rating ? 'rotate-180' : ''}`} />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${openSections.rating ? 'max-h-[250px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col gap-1.5">
            {[4, 3, 2, 1].map(stars => (
              <button key={stars} onClick={() => setRating(currentRating === stars ? 0 : stars)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 ${currentRating === stars ? 'bg-[#fb5607]/8 ring-1 ring-[#fb5607]/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'}`}>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={13} className={i <= stars ? 'text-amber-400 fill-amber-400' : 'text-zinc-200 dark:text-zinc-700'} />)}
                </div>
                <span className={`text-[11px] font-medium ${currentRating === stars ? 'text-[#fb5607]' : 'text-zinc-400'}`}>& up</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const displayTitle = propTitle || getDynamicTitle();

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Navbar />

      {/* Clean Header Area */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
        <div className="w-full max-w-[1920px] mx-auto" style={{ paddingLeft: 'clamp(16px, 4vw, 64px)', paddingRight: 'clamp(16px, 4vw, 64px)' }}>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-600 pt-4 overflow-x-auto whitespace-nowrap no-scrollbar">
            <a href="/" className="hover:text-[#fb5607] transition-colors">Home</a>
            {!isSearch && (
              <>
                <ChevronRight size={9} className="text-zinc-300 dark:text-zinc-700" />
                <span>{toTitleCase(activeMainCat === 'all' ? 'Products' : activeMainCat)}</span>
                {activeGender !== 'all' && (<><ChevronRight size={9} className="text-zinc-300 dark:text-zinc-700" /><span className="text-zinc-600 dark:text-zinc-400 font-medium">{toTitleCase(activeGender)}</span></>)}
                {activeSubCat !== 'all' && (<><ChevronRight size={9} className="text-zinc-300 dark:text-zinc-700" /><span className="text-zinc-600 dark:text-zinc-400 font-medium">{toTitleCase(activeSubCat)}</span></>)}
              </>
            )}
          </div>

          {/* Title + Count row */}
          <div className="flex items-baseline justify-between pt-4 pb-1">
            <h1 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
              {displayTitle}
            </h1>
            <span className="text-[11px] text-zinc-400 font-medium shrink-0 ml-4">{total} products</span>
          </div>

          {/* Subcategory Tabs */}
          {subCategories.length > 0 && (
            <div className="flex items-center gap-2 pb-3 pt-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setCategory(activeMainCat, activeGender, 'all')}
                className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${
                  activeSubCat === 'all'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                    : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                }`}
              >
                All
              </button>
              {subCategories.map((sub, idx) => (
                <button
                  key={`subcat-${idx}-${sub}`}
                  onClick={() => setCategory(activeMainCat, activeGender, sub)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all border capitalize ${
                    activeSubCat === sub
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                      : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full max-w-[1920px] mx-auto pb-20 pt-5" style={{ paddingLeft: 'clamp(16px, 4vw, 64px)', paddingRight: 'clamp(16px, 4vw, 64px)' }}>

        {/* MOBILE: Sticky Filter + Sort Bar */}
        <div className="lg:hidden sticky top-[57px] z-30 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl mb-4 overflow-hidden">
          <div className="flex">
            <button onClick={() => { setShowFilters(!showFilters); setIsSortOpen(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-semibold border-r border-zinc-100 dark:border-zinc-800 transition-colors uppercase tracking-wider ${showFilters ? 'text-[#fb5607]' : 'text-zinc-600 dark:text-zinc-300'}`}>
              <SlidersHorizontal size={13} /> Filters {activeFilterCount > 0 && <span className="bg-[#fb5607] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{activeFilterCount}</span>}
            </button>
            <button onClick={() => { setIsSortOpen(!isSortOpen); setShowFilters(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${isSortOpen ? 'text-[#fb5607]' : 'text-zinc-600 dark:text-zinc-300'}`}>
              <ArrowDownUp size={13} /> Sort
            </button>
          </div>
        </div>

        {/* MOBILE: Filter Bottom Sheet */}
        <AnimatePresence>
          {showFilters && (<>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-2xl max-h-[70vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white dark:bg-zinc-900 flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Filters</h3>
                <div className="flex items-center gap-4">
                  {draftFilterCount > 0 && <button onClick={clearDraftFilters} className="text-[11px] text-[#fb5607] font-semibold">Clear All</button>}
                  <button onClick={() => setShowFilters(false)} className="text-zinc-400 text-lg">✕</button>
                </div>
              </div>
              <div className="p-5">
                <FilterContent currentRating={draftMinRating} setRating={setDraftMinRating} currentSizes={draftSelectedSizes} toggleSizeHandler={toggleDraftSize} />
              </div>
              <div className="sticky bottom-0 p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                <button onClick={() => {
                  setMinRating(draftMinRating);
                  setSelectedSizes(draftSelectedSizes);
                  setShowFilters(false);
                }} className="w-full bg-[#fb5607] text-white py-3 rounded-xl font-semibold text-[12px] tracking-wide">Apply Filters</button>
              </div>
            </motion.div>
          </>)}
        </AnimatePresence>

        {/* MOBILE: Sort Bottom Sheet */}
        <AnimatePresence>
          {isSortOpen && (<>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSortOpen(false)} className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-2xl shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Sort by</h3>
                <button onClick={() => setIsSortOpen(false)} className="text-zinc-400 text-lg">✕</button>
              </div>
              <div className="py-1">
                {sortOptions.map((option) => (
                  <button key={option.value} onClick={() => { setSort(option.value); setIsSortOpen(false); }}
                    className={`w-full flex items-center justify-between px-5 py-3.5 text-[12px] transition-all ${sort === option.value ? 'text-[#fb5607] font-bold bg-[#fb5607]/5' : 'text-zinc-600 dark:text-zinc-300 font-medium'}`}>
                    {option.label}
                    {sort === option.value && <Check size={14} className="text-[#fb5607]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>)}
        </AnimatePresence>

        {/* SIDEBAR + GRID */}
        <div className="flex flex-col lg:flex-row gap-6 items-start relative min-h-[400px]">
          {/* Loading overlay */}
          <AnimatePresence>
            {loading && products.length > 0 && <BrandLoaderOverlay />}
          </AnimatePresence>

          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-[220px] flex-shrink-0 lg:sticky top-24 z-10">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-[0.2em]">Filters</h2>
                  <div className="w-8 h-[2px] bg-[#fb5607] mt-1.5 rounded-full" />
                </div>
                {activeFilterCount > 0 && <button onClick={clearAllFilters} className="text-[10px] text-[#fb5607] font-semibold hover:underline">Clear All</button>}
              </div>
              <div className="mt-5 max-h-[calc(100vh-200px)] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                <FilterContent currentRating={minRating} setRating={setMinRating} currentSizes={selectedSizes} toggleSizeHandler={toggleSize} />
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1 w-full relative">
            {/* Desktop Sort */}
            <div className="hidden lg:flex items-center justify-end mb-4">
              <div className="relative">
                <button onClick={() => setIsSortOpen(!isSortOpen)} onBlur={() => setTimeout(() => setIsSortOpen(false), 200)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-semibold bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer uppercase tracking-wider">
                  <ArrowDownUp size={13} className="text-zinc-400" />
                  <span className="text-zinc-400">Sort:</span>
                  <span className="text-zinc-800 dark:text-white">{sortOptions.find(o => o.value === sort)?.label}</span>
                  <ChevronDown size={12} className={`text-zinc-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-[200px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50 py-1">
                      {sortOptions.map((option) => (
                        <button key={option.value} onClick={() => { setSort(option.value); setIsSortOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left text-[11px] font-medium transition-all flex items-center justify-between ${sort === option.value ? 'text-[#fb5607] bg-[#fb5607]/5 font-semibold' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'}`}>
                          {option.label}
                          {sort === option.value && <Check size={12} className="text-[#fb5607]" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* PRODUCT GRID — 4 cols desktop, 2 mobile */}
            <div className="relative min-h-[400px]">
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-12">
                    {products.map((product) => <ProductCard key={product._id} product={product} />)}
                  </div>
                  {total > products.length && !loading && (
                    <div className="flex justify-center mb-12">
                      <button onClick={() => setPage(prev => prev + 1)} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-[#fb5607] dark:hover:bg-[#fb5607] dark:hover:text-white px-10 py-3 rounded-xl text-[11px] font-semibold transition-all uppercase tracking-wider">Load More</button>
                    </div>
                  )}
                </>
              ) : (
                !loading && (
                  <NoResultsSection query={query} isSearch={isSearch} clearAllFilters={() => { clearAllFilters(); setCategory(activeMainCat, activeGender, 'all'); }} activeFilterCount={activeFilterCount} activeSubCat={activeSubCat} />
                )
              )}
              {loading && products.length === 0 && (
                <div className="flex items-center justify-center py-32">
                  <BrandLoader size="lg" />
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
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center"><BrandLoader size="lg" /></div>}>
      <DiscoveryContent {...props} />
    </Suspense>
  );
}
