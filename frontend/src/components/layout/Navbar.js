'use client';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { ShoppingCart, Heart, User, Search, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useRouter } from 'next/navigation';
import API from '@/utils/api';

export default function Navbar() {
  const { cart, user, wishlist, activeMainCat, activeGender, activeSubCat } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timeoutId = setTimeout(async () => {
        try {
          const { data } = await API.get(`/products/suggestions?q=${searchQuery}`);
          setSuggestions(data);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync wishlist on mount if user is logged in
  const { setWishlist } = useStore();
  useEffect(() => {
    if (user) {
      const syncWishlist = async () => {
        try {
          const { data } = await API.get('/users/wishlist');
          setWishlist(data);
        } catch (error) {
          console.error('Error syncing wishlist:', error);
        }
      };
      syncWishlist();
    }
  }, [user]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        router.push(`/product/${suggestions[selectedIndex]._id}`);
        setSearchQuery('');
        setIsSearchFocused(false);
      } else if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery('');
        setIsSearchFocused(false);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };


  return (
    <nav className="sticky top-0 w-full z-50 bg-white dark:bg-zinc-950 shadow-sm border-b border-zinc-100 dark:border-white/5 py-3 lg:py-4 transition-all duration-300">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* LEFT: LOGO + NAV LINKS */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white relative group shrink-0">
            CRAYZEE<span className="text-[#fb5607]">.IN</span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/men"
              className={`relative text-sm font-black uppercase tracking-wide py-1 transition-colors ${activeGender === 'men' ? 'text-[#fb5607]' : 'text-zinc-700 dark:text-zinc-200 hover:text-[#fb5607]'}`}
            >
              Men
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#fb5607] transition-transform origin-left ${activeGender === 'men' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
            </Link>
            <Link
              href="/women"
              className={`relative text-sm font-black uppercase tracking-wide py-1 transition-colors ${activeGender === 'women' ? 'text-[#fb5607]' : 'text-zinc-700 dark:text-zinc-200 hover:text-[#fb5607]'}`}
            >
              Women
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#fb5607] transition-transform origin-left ${activeGender === 'women' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
            </Link>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          <div className="relative hidden sm:block search-container">
            <div className="relative">
              <input
                suppressHydrationWarning
                type="text"
                placeholder="Search gear..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                className="pl-10 pr-4 py-2 bg-zinc-50 dark:bg-white/10 border border-zinc-200 dark:border-white/5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#fb5607] w-40 xl:w-64 text-zinc-900 dark:text-white transition-all"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {isSearchFocused && (suggestions.length > 0 || searchQuery.length > 2) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-[350px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-100 dark:border-white/5 overflow-hidden z-[60]"
                >
                  <div className="p-2">
                    {suggestions.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {suggestions.map((item, idx) => (
                          <button
                            key={item._id}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            onClick={() => {
                              router.push(`/product/${item._id}`);
                              setSearchQuery('');
                              setIsSearchFocused(false);
                            }}
                            className={`flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${selectedIndex === idx ? 'bg-zinc-50 dark:bg-white/5' : ''}`}
                          >
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-zinc-100 dark:border-white/5">
                              {(item.images?.[0]?.url || item.image) ? (
                                <img src={item.images?.[0]?.url || item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-white/5 text-[8px] font-black text-zinc-400">
                                  NA
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-black uppercase truncate tracking-tight">{item.name}</h4>
                              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.subCategory}</p>
                              <p className="text-xs font-black text-[#fb5607] mt-0.5">₹{item.price}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : searchQuery.length > 2 && (
                      <div className="p-4 text-center">
                        <p className="text-xs font-bold text-txt-muted uppercase tracking-widest">No exact matches found</p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="w-full p-3 mt-1 border-t border-zinc-50 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[#fb5607] transition-colors flex items-center justify-center gap-2"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


          <Link href="/wishlist" className="relative group text-zinc-800 dark:text-zinc-200">
            <Heart className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] group-hover:fill-[#fb5607] group-hover:text-[#fb5607] transition-all" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#fb5607] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link href="/cart" className="relative group text-zinc-800 dark:text-zinc-200">
            <ShoppingCart className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] group-hover:text-[#fb5607] transition-all" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#fb5607] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">
                {cart.reduce((total, item) => total + item.qty, 0)}
              </span>
            )}
          </Link>

          {user?.role === 'admin' && (
            <Link href="/admin" className="hidden xl:flex items-center gap-2 group">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white bg-[#fb5607] px-4 py-1.5 rounded-full shadow-lg shadow-[#fb5607]/20 group-hover:scale-110 transition-transform">
                Admin
              </span>
            </Link>
          )}

          <Link href={user ? "/profile" : "/login"} className="group flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
            <User className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] group-hover:text-[#fb5607] transition-all" />
            <span className="hidden xl:block text-[10px] font-black uppercase tracking-widest text-[#fb5607]">
              {user ? 'Account' : 'Join / Login'}
            </span>
          </Link>

          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="sm:hidden p-1.5 text-zinc-800 dark:text-zinc-200"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-1.5 text-zinc-800 dark:text-zinc-200">
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* MOBILE SEARCH OVERLAY */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white dark:bg-zinc-950 z-[100] p-6 pt-20"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="relative flex-1">
                <input
                  autoFocus
                  type="text"
                  placeholder="What are we looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                      setIsMobileSearchOpen(false);
                      setSearchQuery('');
                    }
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-100 dark:bg-white/5 rounded-2xl text-lg font-bold outline-none border-2 border-transparent focus:border-[#fb5607]"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={24} />
              </div>
              <button
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-4 bg-zinc-100 dark:bg-white/5 rounded-2xl"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mobile Suggestions */}
            <div className="flex flex-col gap-2">
              {suggestions.map(item => (
                <button
                  key={item._id}
                  onClick={() => {
                    router.push(`/product/${item._id}`);
                    setIsMobileSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-white/5 rounded-3xl text-left"
                >
                  <img src={item.image} className="w-16 h-16 object-cover rounded-2xl" />
                  <div>
                    <h4 className="font-black uppercase tracking-tight text-sm">{item.name}</h4>
                    <p className="text-[#fb5607] font-black text-xs mt-1">₹{item.price}</p>
                  </div>
                </button>
              ))}
              {searchQuery.trim().length > 2 && (
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                    setIsMobileSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full py-5 rounded-3xl bg-black text-white font-black uppercase tracking-widest text-xs mt-4"
                >
                  See all matches
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-white dark:bg-zinc-950 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-12">
                <Link href="/" className="text-2xl font-black">CRAYZEE</Link>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-zinc-100 dark:bg-white/5 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-white/5 pb-2">Shop By</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/men"
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-4 py-4 rounded-2xl text-sm font-black transition-all text-center uppercase tracking-widest ${activeGender === 'men' ? 'bg-[#fb5607] text-white shadow-lg shadow-[#fb5607]/20' : 'bg-zinc-50 dark:bg-white/5 text-zinc-900 dark:text-zinc-50'}`}
                    >
                      Men
                    </Link>
                    <Link
                      href="/women"
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-4 py-4 rounded-2xl text-sm font-black transition-all text-center uppercase tracking-widest ${activeGender === 'women' ? 'bg-[#fb5607] text-white shadow-lg shadow-[#fb5607]/20' : 'bg-zinc-50 dark:bg-white/5 text-zinc-900 dark:text-zinc-50'}`}
                    >
                      Women
                    </Link>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] border-b border-zinc-100 dark:border-white/5 pb-2">Quick Links</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/browse" onClick={() => setIsMenuOpen(false)} className="px-4 py-4 rounded-2xl text-sm font-black transition-all text-center uppercase tracking-widest bg-zinc-50 dark:bg-white/5 text-zinc-900 dark:text-zinc-50">
                      All Drops
                    </Link>
                    <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="px-4 py-4 rounded-2xl text-sm font-black transition-all text-center uppercase tracking-widest bg-zinc-50 dark:bg-white/5 text-zinc-900 dark:text-zinc-50">
                      Contact
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-zinc-100 dark:border-white/5 space-y-4">
                <Link href={user ? "/profile" : "/login"} onClick={() => setIsMenuOpen(false)} className="w-full btn-primary py-4 rounded-3xl text-sm tracking-widest uppercase flex items-center justify-center">
                  {user ? 'My Profile' : 'Login / Join'}
                </Link>
                {!user && (
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="block text-center text-[10px] font-black text-zinc-400 tracking-widest uppercase hover:text-[#fb5607]">New here? Create Account</Link>
                )}
                {user?.role === 'admin' && (
                  <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="block text-center text-[10px] font-black text-[#fb5607] tracking-widest uppercase underline">Admin Dash</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
