'use client';
import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroCarousel from '@/components/layout/HeroCarousel';
import ProductCard from '@/components/product/ProductCard';
import API from '@/utils/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Zap, Flame, Crown, ArrowRight, Star, Instagram, Mail, Truck, Shield, RefreshCw, Headphones, ChevronLeft } from 'lucide-react';

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const { data } = await API.get('/products?limit=50');
        const allProducts = data.products || [];

        // New Arrivals (Latest 8)
        setNewArrivals(allProducts.slice(0, 8));

        // Featured (Trending)
        const featuredProducts = allProducts.filter(p => p.isFeatured).slice(0, 8);
        setFeatured(featuredProducts.length > 0 ? featuredProducts : allProducts.slice(8, 16));

      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const scroll = (ref, dir) => {
    if (ref.current) {
      const scrollAmount = ref.current.offsetWidth * 0.7;
      ref.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <main className="bg-white dark:bg-zinc-950 min-h-screen">
      <Navbar />

      {/* 1️⃣ Hero Carousel */}
      <HeroCarousel />

      {/* 2️⃣ Trust Badges */}
      <section className="border-b border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-[1920px] mx-auto" style={{ padding: 'clamp(18px, 2.2vw, 32px) clamp(16px, 5vw, 80px)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'clamp(12px, 2vw, 32px)' }}>
            {[
              { icon: Truck, label: 'Free Shipping', sub: 'Orders above ₹499' },
              { icon: Shield, label: '100% Genuine', sub: 'Authentic products' },
              { icon: RefreshCw, label: 'Easy Returns', sub: '7-day policy' },
              { icon: Headphones, label: '24/7 Support', sub: 'Always here' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-center text-center" style={{ gap: 'clamp(8px, 0.8vw, 14px)' }}>
                <div className="shrink-0 flex items-center justify-center rounded-xl bg-[#fb5607]/5 dark:bg-[#fb5607]/10" style={{ width: 'clamp(32px, 2.8vw, 44px)', height: 'clamp(32px, 2.8vw, 44px)' }}>
                  <item.icon className="text-[#fb5607]" style={{ width: 'clamp(14px, 1.2vw, 20px)', height: 'clamp(14px, 1.2vw, 20px)', strokeWidth: 1.8 }} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 leading-tight" style={{ fontSize: 'clamp(10px, 0.8vw, 14px)' }}>{item.label}</p>
                  <p className="text-zinc-400 dark:text-zinc-500 leading-tight" style={{ fontSize: 'clamp(8px, 0.65vw, 11px)' }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3️⃣ New Arrivals - Horizontal Scroll */}
      <section className="bg-white dark:bg-zinc-950" style={{ padding: 'clamp(28px, 3.5vw, 56px) 0' }}>
        <div className="w-full max-w-[1920px] mx-auto" style={{ paddingLeft: 'clamp(16px, 5vw, 80px)', paddingRight: 'clamp(16px, 5vw, 80px)' }}>
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between" style={{ marginBottom: 'clamp(16px, 2vw, 28px)', gap: 'clamp(8px, 1vw, 16px)' }}>
            <div>
              <div className="flex items-center text-[#fb5607] font-bold uppercase tracking-[0.2em]" style={{ gap: 'clamp(6px, 0.5vw, 10px)', fontSize: 'clamp(9px, 0.7vw, 11px)', marginBottom: 'clamp(8px, 1vw, 14px)' }}>
                <Zap className="fill-[#fb5607]" style={{ width: 'clamp(11px, 0.9vw, 14px)', height: 'clamp(11px, 0.9vw, 14px)' }} /> Fresh Out the Lab
              </div>
              <h2 className="font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.05]" style={{ fontSize: 'clamp(26px, 3.5vw, 52px)' }}>
                New <span className="text-[#fb5607]">Arrivals</span>
              </h2>
            </div>
            <div className="flex items-center" style={{ gap: 'clamp(8px, 0.8vw, 14px)' }}>
              <button onClick={() => scroll(scrollRef1, 'left')} className="hidden md:flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-[#fb5607] hover:text-white hover:border-[#fb5607] text-zinc-500 transition-all" style={{ width: 'clamp(32px, 2.5vw, 40px)', height: 'clamp(32px, 2.5vw, 40px)' }}>
                <ChevronLeft style={{ width: 'clamp(14px, 1vw, 18px)', height: 'clamp(14px, 1vw, 18px)' }} />
              </button>
              <button onClick={() => scroll(scrollRef1, 'right')} className="hidden md:flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-[#fb5607] hover:text-white hover:border-[#fb5607] text-zinc-500 transition-all" style={{ width: 'clamp(32px, 2.5vw, 40px)', height: 'clamp(32px, 2.5vw, 40px)' }}>
                <ChevronRight style={{ width: 'clamp(14px, 1vw, 18px)', height: 'clamp(14px, 1vw, 18px)' }} />
              </button>
              <Link href="/browse?sort=newest" className="group flex items-center text-zinc-500 hover:text-[#fb5607] transition-all" style={{ gap: 'clamp(6px, 0.6vw, 10px)', fontSize: 'clamp(10px, 0.8vw, 13px)', fontWeight: 600, marginLeft: 'clamp(4px, 0.5vw, 8px)' }}>
                View All
                <ArrowRight className="group-hover:translate-x-1 transition-transform" style={{ width: 'clamp(12px, 1vw, 16px)', height: 'clamp(12px, 1vw, 16px)' }} />
              </Link>
            </div>
          </div>

          {/* Horizontal Scroll */}
          <div ref={scrollRef1} className="scroll-strip">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-lg" style={{ width: 'clamp(180px, 20vw, 300px)' }} />
              ))
            ) : (
              newArrivals.map((product) => (
                <div key={product._id} style={{ width: 'clamp(180px, 20vw, 300px)' }}>
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 5️⃣ Trending Drops - Grid Layout */}
      <section className="bg-zinc-50 dark:bg-zinc-900/30 relative overflow-hidden" style={{ padding: 'clamp(28px, 3.5vw, 56px) 0' }}>
        <div className="w-full max-w-[1920px] mx-auto" style={{ paddingLeft: 'clamp(16px, 5vw, 80px)', paddingRight: 'clamp(16px, 5vw, 80px)' }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between" style={{ marginBottom: 'clamp(16px, 2vw, 28px)', gap: 'clamp(8px, 1vw, 16px)' }}>
            <div>
              <div className="flex items-center text-[#fb5607] font-bold uppercase tracking-[0.2em]" style={{ gap: 'clamp(6px, 0.5vw, 10px)', fontSize: 'clamp(9px, 0.7vw, 11px)', marginBottom: 'clamp(8px, 1vw, 14px)' }}>
                <Flame className="fill-[#fb5607]" style={{ width: 'clamp(11px, 0.9vw, 14px)', height: 'clamp(11px, 0.9vw, 14px)' }} /> Trending Now
              </div>
              <h2 className="font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.05]" style={{ fontSize: 'clamp(26px, 3.5vw, 52px)' }}>
                Trending <span className="text-[#fb5607]">Drops</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'clamp(12px, 1.8vw, 32px)' }}>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-lg" />
              ))
            ) : (
              featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>


      {/* 7️⃣ Footer */}
      <footer className="bg-zinc-950 text-white border-t border-white/5" style={{ paddingTop: 'clamp(32px, 4vw, 64px)', paddingBottom: 'clamp(20px, 2.5vw, 36px)' }}>
        <div className="w-full max-w-[1920px] mx-auto" style={{ paddingLeft: 'clamp(16px, 5vw, 80px)', paddingRight: 'clamp(16px, 5vw, 80px)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4" style={{ gap: 'clamp(24px, 3vw, 40px)', marginBottom: 'clamp(32px, 4vw, 56px)' }}>
            {/* Brand */}
            <div className="col-span-1 sm:col-span-2 md:col-span-2">
              <Link href="/" className="font-bold tracking-tight text-white block" style={{ fontSize: 'clamp(22px, 2.2vw, 36px)', marginBottom: 'clamp(14px, 1.8vw, 24px)' }}>
                CRAYZEE<span className="text-[#fb5607]">.IN</span>
              </Link>
              <p className="text-zinc-500 font-normal leading-relaxed" style={{ maxWidth: 'clamp(280px, 30vw, 400px)', fontSize: 'clamp(12px, 0.95vw, 15px)', marginBottom: 'clamp(20px, 2.5vw, 36px)' }}>
                India's wildest streetwear label. We don't just sell clothes, we drop vibes. Built for the rebels, the dreamers, and the ones who never blend in.
              </p>
              <div className="flex" style={{ gap: 'clamp(8px, 0.8vw, 14px)' }}>
                <a href="https://www.instagram.com/crayzee.in?igsh=MXQzNjF3cDE3bmpoZA==" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/5 flex items-center justify-center hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] transition-all cursor-pointer group" style={{ width: 'clamp(38px, 3vw, 48px)', height: 'clamp(38px, 3vw, 48px)' }}>
                  <Instagram className="text-zinc-400 group-hover:text-white transition-colors" style={{ width: 'clamp(15px, 1.1vw, 18px)', height: 'clamp(15px, 1.1vw, 18px)' }} />
                </a>
                <a href="https://mail.google.com/mail/?view=cm&to=crayzee.in@gmail.com" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#fb5607] transition-all cursor-pointer group" style={{ width: 'clamp(38px, 3vw, 48px)', height: 'clamp(38px, 3vw, 48px)' }}>
                  <Mail className="text-zinc-400 group-hover:text-white transition-colors" style={{ width: 'clamp(15px, 1.1vw, 18px)', height: 'clamp(15px, 1.1vw, 18px)' }} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold uppercase tracking-[0.2em] text-zinc-500" style={{ fontSize: 'clamp(9px, 0.7vw, 11px)', marginBottom: 'clamp(18px, 2.2vw, 32px)' }}>Quick Links</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.2vw, 18px)' }}>
                <li><Link href="/browse" className="font-medium text-zinc-400 hover:text-white transition-colors" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>Shop All</Link></li>
                <li><Link href="/orders" className="font-medium text-zinc-400 hover:text-white transition-colors" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>Track Order</Link></li>
                <li><Link href="/profile" className="font-medium text-zinc-400 hover:text-white transition-colors" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>My Account</Link></li>
                <li><Link href="/wishlist" className="font-medium text-zinc-400 hover:text-white transition-colors" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>Wishlist</Link></li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="font-bold uppercase tracking-[0.2em] text-zinc-500" style={{ fontSize: 'clamp(9px, 0.7vw, 11px)', marginBottom: 'clamp(18px, 2.2vw, 32px)' }}>Info</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.2vw, 18px)' }}>
                <li><Link href="/privacy-policy" className="font-medium text-zinc-400 hover:text-white transition-colors" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>Privacy Policy</Link></li>
                <li><Link href="/contact" className="font-medium text-zinc-400 hover:text-white transition-colors" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>Contact Us</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/5 flex flex-col md:flex-row justify-between items-center" style={{ paddingTop: 'clamp(18px, 2.2vw, 32px)', gap: 'clamp(12px, 1.5vw, 24px)' }}>
            <p className="text-zinc-600 font-medium" style={{ fontSize: 'clamp(9px, 0.7vw, 11px)', letterSpacing: '0.12em' }}>© 2026 CRAYZEE STREETWEAR CO. MADE IN INDIA 🇮🇳</p>
            <div className="flex items-center opacity-25 invert" style={{ gap: 'clamp(12px, 1.5vw, 24px)' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" style={{ height: 'clamp(12px, 1vw, 16px)' }} />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" style={{ height: 'clamp(12px, 1vw, 16px)' }} />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" style={{ height: 'clamp(12px, 1vw, 16px)' }} />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
