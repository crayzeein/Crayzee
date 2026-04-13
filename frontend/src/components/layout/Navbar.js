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

      {/* MOBILE MENU - Bewakoof Style Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            {/* Sidebar drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[380px] bg-white dark:bg-zinc-950 z-[60] overflow-y-auto shadow-2xl"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* User Greeting Header */}
              <div className="flex items-center justify-between p-5 pb-4 border-b border-zinc-100 dark:border-white/10">
                <Link href={user ? "/profile" : "/login"} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                    {user ? (
                      <span className="text-lg font-black text-[#fb5607] uppercase">{user.name?.charAt(0)}</span>
                    ) : (
                      <User className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-900 dark:text-white">
                      {user ? `Hey, ${user.name?.split(' ')[0]}!` : 'Hey There!'}
                    </h3>
                    <p className="text-xs font-bold text-[#2874f0]">
                      {user ? user.email : 'Login / Sign Up'}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* SHOP IN Section */}
              <div className="px-5 pt-6 pb-4">
                <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.25em] mb-2">Shop In</h4>
                <Link
                  href="/men"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 py-4 border-b border-zinc-50 dark:border-white/5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-[#fb5607]/10 transition-colors">
                    {/* Male icon - short hair, broader shoulders */}
                    <svg className="w-7 h-7 text-zinc-500 dark:text-zinc-400 group-hover:text-[#fb5607] transition-colors" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="32" cy="20" r="10"/>
                      <path d="M22 20c0-5 2-10 10-10s10 5 10 10"/>
                      <path d="M16 54v-4c0-7 5-12 16-12s16 5 16 12v4"/>
                      <line x1="22" y1="16" x2="22" y2="12"/>
                      <line x1="42" y1="16" x2="42" y2="12"/>
                    </svg>
                  </div>
                  <span className={`text-[15px] font-bold ${activeGender === 'men' ? 'text-[#fb5607]' : 'text-zinc-800 dark:text-zinc-100 group-hover:text-[#fb5607]'} transition-colors`}>
                    Men
                  </span>
                </Link>
                <Link
                  href="/women"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 py-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-[#fb5607]/10 transition-colors">
                    {/* Female icon - longer hair, earrings hint */}
                    <svg className="w-7 h-7 text-zinc-500 dark:text-zinc-400 group-hover:text-[#fb5607] transition-colors" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="32" cy="20" r="10"/>
                      <path d="M22 18c-2 2-3 8-2 16"/>
                      <path d="M42 18c2 2 3 8 2 16"/>
                      <path d="M16 54v-4c0-7 5-12 16-12s16 5 16 12v4"/>
                      <path d="M26 30c0 0 2 3 6 3s6-3 6-3"/>
                    </svg>
                  </div>
                  <span className={`text-[15px] font-bold ${activeGender === 'women' ? 'text-[#fb5607]' : 'text-zinc-800 dark:text-zinc-100 group-hover:text-[#fb5607]'} transition-colors`}>
                    Women
                  </span>
                </Link>
              </div>

              {/* Divider */}
              <div className="h-[6px] bg-zinc-50 dark:bg-white/[0.02]" />

              {/* MY PROFILE Section - Icon Grid */}
              <div className="px-5 pt-6 pb-5">
                <h4 className="text-[10px] font-black text-[#fb5607] uppercase tracking-[0.25em] mb-5">My Profile</h4>
                <div className="grid grid-cols-4 gap-3">
                  <Link
                    href={user ? "/profile" : "/login"}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 flex items-center justify-center group-hover:border-[#fb5607] group-hover:bg-[#fb5607]/5 transition-all">
                      <svg className="w-6 h-6 text-[#f5a623] group-hover:text-[#fb5607] transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 text-center leading-tight">My Account</span>
                  </Link>

                  <Link
                    href={user ? "/orders" : "/login"}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 flex items-center justify-center group-hover:border-[#fb5607] group-hover:bg-[#fb5607]/5 transition-all">
                      <svg className="w-6 h-6 text-[#f5a623] group-hover:text-[#fb5607] transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 text-center leading-tight">My Orders</span>
                  </Link>

                  <Link
                    href="/cart"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="relative w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 flex items-center justify-center group-hover:border-[#fb5607] group-hover:bg-[#fb5607]/5 transition-all">
                      <svg className="w-6 h-6 text-[#f5a623] group-hover:text-[#fb5607] transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
                      {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#fb5607] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                          {cart.reduce((total, item) => total + item.qty, 0)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 text-center leading-tight">My Cart</span>
                  </Link>

                  <Link
                    href="/wishlist"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="relative w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 flex items-center justify-center group-hover:border-[#fb5607] group-hover:bg-[#fb5607]/5 transition-all">
                      <svg className="w-6 h-6 text-[#f5a623] group-hover:text-[#fb5607] transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      {wishlist.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#fb5607] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                          {wishlist.length}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 text-center leading-tight">My Wishlist</span>
                  </Link>
                </div>
              </div>

              {/* Divider */}
              <div className="h-[6px] bg-zinc-50 dark:bg-white/[0.02]" />

              {/* CONTACT US Section */}
              <div className="px-5 pt-6 pb-4">
                <h4 className="text-[10px] font-black text-[#fb5607] uppercase tracking-[0.25em] mb-3">Contact Us</h4>
                <Link
                  href="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center py-3.5 group"
                >
                  <span className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-[#fb5607] transition-colors">Help & Support</span>
                </Link>
              </div>

              {/* Divider */}
              <div className="h-[6px] bg-zinc-50 dark:bg-white/[0.02]" />

              {/* ABOUT US Section */}
              <div className="px-5 pt-6 pb-4">
                <h4 className="text-[10px] font-black text-[#fb5607] uppercase tracking-[0.25em] mb-3">About Us</h4>
                <Link
                  href="/browse"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center py-3.5 border-b border-zinc-50 dark:border-white/5 group"
                >
                  <span className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-[#fb5607] transition-colors">All Drops</span>
                </Link>
                <Link
                  href="/privacy-policy"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center py-3.5 group"
                >
                  <span className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-[#fb5607] transition-colors">Privacy Policy</span>
                </Link>
              </div>

              {/* Admin Link - only for admins */}
              {user?.role === 'admin' && (
                <>
                  <div className="h-[6px] bg-zinc-50 dark:bg-white/[0.02]" />
                  <div className="px-5 pt-5 pb-4">
                    <Link
                      href="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3.5 py-3 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#fb5607] flex items-center justify-center">
                        <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                      </div>
                      <span className="text-[15px] font-black text-[#fb5607] uppercase tracking-wide">Admin Dashboard</span>
                    </Link>
                  </div>
                </>
              )}

              {/* Bottom Login/Logout Bar */}
              <div className="sticky bottom-0 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-white/10 p-4 mt-4">
                {user ? (
                  <button
                    onClick={() => {
                      const { logout } = useStore.getState();
                      logout();
                      setIsMenuOpen(false);
                      router.push('/');
                    }}
                    className="w-full py-3.5 rounded-2xl bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full py-3.5 rounded-2xl bg-[#fb5607] text-white text-xs font-black uppercase tracking-widest text-center shadow-lg shadow-[#fb5607]/20 hover:bg-[#ff6b2b] transition-all"
                  >
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
