'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroCarousel from '@/components/layout/HeroCarousel';
import ProductCard from '@/components/product/ProductCard';
import API from '@/utils/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Zap, Flame, Crown, ArrowRight, Star, Instagram, Mail, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="bg-white dark:bg-zinc-950 min-h-screen">
      <Navbar />

      {/* 1️⃣ Hero Carousel */}
      <HeroCarousel />

      {/* 2️⃣ Trust Badges / Features Strip */}
      <section className="border-b border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-[1920px] mx-auto" style={{ padding: 'clamp(14px, 1.8vw, 24px) clamp(16px, 5vw, 80px)' }}>
          <div className="grid grid-cols-4" style={{ gap: 'clamp(8px, 1.5vw, 24px)' }}>
            {[
              { icon: Truck, label: 'Free Shipping', sub: 'Orders above ₹499' },
              { icon: Shield, label: '100% Genuine', sub: 'Authentic products' },
              { icon: RefreshCw, label: 'Easy Returns', sub: '7-day policy' },
              { icon: Headphones, label: '24/7 Support', sub: 'Always here' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-center text-center" style={{ gap: 'clamp(6px, 0.7vw, 12px)' }}>
                <item.icon className="text-[#fb5607] shrink-0" style={{ width: 'clamp(14px, 1.2vw, 20px)', height: 'clamp(14px, 1.2vw, 20px)', strokeWidth: 1.5 }} />
                <div className="text-left">
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 leading-tight" style={{ fontSize: 'clamp(9px, 0.75vw, 13px)' }}>{item.label}</p>
                  <p className="text-zinc-400 dark:text-zinc-500 leading-tight" style={{ fontSize: 'clamp(7px, 0.6vw, 10px)' }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3️⃣ New Arrivals */}
      <section className="bg-white dark:bg-zinc-950" style={{ padding: 'clamp(40px, 6vw, 96px) 0' }}>
        <div className="w-full max-w-[1920px] mx-auto" style={{ paddingLeft: 'clamp(16px, 5vw, 80px)', paddingRight: 'clamp(16px, 5vw, 80px)' }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12" style={{ gap: 'clamp(12px, 1.5vw, 24px)' }}>
            <div>
              <div className="flex items-center text-[#fb5607] font-black uppercase tracking-widest" style={{ gap: 'clamp(4px, 0.4vw, 8px)', fontSize: 'clamp(8px, 0.65vw, 10px)', marginBottom: 'clamp(8px, 1vw, 16px)' }}>
                <Zap className="fill-[#fb5607]" style={{ width: 'clamp(10px, 0.9vw, 14px)', height: 'clamp(10px, 0.9vw, 14px)' }} /> Fresh Out the Lab
              </div>
              <h2 className="font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight" style={{ fontSize: 'clamp(22px, 3vw, 48px)' }}>
                New <span className="text-[#fb5607]">Arrivals</span>
              </h2>
            </div>
            <Link href="/browse?sort=newest" className="group flex items-center text-zinc-500 hover:text-black dark:hover:text-white transition-all" style={{ gap: 'clamp(6px, 0.8vw, 12px)', fontSize: 'clamp(9px, 0.75vw, 12px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              See the full drop
              <div className="rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group-hover:bg-[#fb5607] group-hover:text-white group-hover:border-[#fb5607] transition-all" style={{ width: 'clamp(28px, 2.5vw, 40px)', height: 'clamp(28px, 2.5vw, 40px)' }}>
                <ArrowRight style={{ width: 'clamp(12px, 1vw, 16px)', height: 'clamp(12px, 1vw, 16px)' }} />
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'clamp(10px, 1.5vw, 32px)' }}>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-lg" />
              ))
            ) : (
              newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4️⃣ Mid-page Category Banner */}
      <section className="bg-zinc-950 dark:bg-zinc-900 overflow-hidden" style={{ padding: 'clamp(32px, 4vw, 64px) 0' }}>
        <div className="w-full max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-2" style={{ paddingLeft: 'clamp(16px, 5vw, 80px)', paddingRight: 'clamp(16px, 5vw, 80px)', gap: 'clamp(12px, 1.5vw, 24px)' }}>
          <Link href="/men" className="group relative rounded-2xl overflow-hidden bg-zinc-800" style={{ minHeight: 'clamp(160px, 18vw, 280px)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-transparent z-10" />
            <div className="absolute inset-0 z-20 flex items-center" style={{ paddingLeft: 'clamp(20px, 3vw, 48px)' }}>
              <div>
                <p className="text-[#fb5607] font-black uppercase tracking-widest" style={{ fontSize: 'clamp(8px, 0.6vw, 10px)', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>Shop Now</p>
                <h3 className="text-white font-black leading-tight" style={{ fontSize: 'clamp(20px, 2.2vw, 40px)' }}>
                  Men's<br />Collection
                </h3>
                <div className="flex items-center text-white/70 group-hover:text-[#fb5607] transition-colors" style={{ marginTop: 'clamp(8px, 1vw, 16px)', gap: 'clamp(4px, 0.3vw, 6px)', fontSize: 'clamp(9px, 0.7vw, 12px)', fontWeight: 700 }}>
                  Explore <ArrowRight className="group-hover:translate-x-1 transition-transform" style={{ width: 'clamp(12px, 1vw, 16px)', height: 'clamp(12px, 1vw, 16px)' }} />
                </div>
              </div>
            </div>
            {/* You can add a background image here if you have category images */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-600 group-hover:scale-105 transition-transform duration-700" />
          </Link>

          <Link href="/women" className="group relative rounded-2xl overflow-hidden bg-zinc-800" style={{ minHeight: 'clamp(160px, 18vw, 280px)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-transparent z-10" />
            <div className="absolute inset-0 z-20 flex items-center" style={{ paddingLeft: 'clamp(20px, 3vw, 48px)' }}>
              <div>
                <p className="text-[#fb5607] font-black uppercase tracking-widest" style={{ fontSize: 'clamp(8px, 0.6vw, 10px)', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>Shop Now</p>
                <h3 className="text-white font-black leading-tight" style={{ fontSize: 'clamp(20px, 2.2vw, 40px)' }}>
                  Women's<br />Collection
                </h3>
                <div className="flex items-center text-white/70 group-hover:text-[#fb5607] transition-colors" style={{ marginTop: 'clamp(8px, 1vw, 16px)', gap: 'clamp(4px, 0.3vw, 6px)', fontSize: 'clamp(9px, 0.7vw, 12px)', fontWeight: 700 }}>
                  Explore <ArrowRight className="group-hover:translate-x-1 transition-transform" style={{ width: 'clamp(12px, 1vw, 16px)', height: 'clamp(12px, 1vw, 16px)' }} />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#fb5607]/40 to-zinc-800 group-hover:scale-105 transition-transform duration-700" />
          </Link>
        </div>
      </section>

      {/* 5️⃣ Trending Featured Section */}
      <section className="bg-zinc-50 dark:bg-zinc-900/40 relative overflow-hidden" style={{ padding: 'clamp(40px, 6vw, 96px) 0' }}>
        <div className="w-full max-w-[1920px] mx-auto" style={{ paddingLeft: 'clamp(16px, 5vw, 80px)', paddingRight: 'clamp(16px, 5vw, 80px)' }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12" style={{ gap: 'clamp(12px, 1.5vw, 24px)' }}>
            <div>
              <div className="flex items-center text-[#fb5607] font-black uppercase tracking-widest" style={{ gap: 'clamp(4px, 0.4vw, 8px)', fontSize: 'clamp(8px, 0.65vw, 10px)', marginBottom: 'clamp(8px, 1vw, 16px)' }}>
                <Flame className="fill-[#fb5607]" style={{ width: 'clamp(10px, 0.9vw, 14px)', height: 'clamp(10px, 0.9vw, 14px)' }} /> Top Rated Vibe
              </div>
              <h2 className="font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight" style={{ fontSize: 'clamp(22px, 3vw, 48px)' }}>
                Trending <span className="text-[#fb5607]">Drops</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'clamp(10px, 1.5vw, 32px)' }}>
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



      {/* 7️⃣ Clean Footer */}
      <footer className="bg-zinc-950 text-white rounded-t-[32px] md:rounded-t-[64px]" style={{ paddingTop: 'clamp(40px, 6vw, 96px)', paddingBottom: 'clamp(24px, 3vw, 48px)' }}>
        <div className="w-full max-w-[1920px] mx-auto" style={{ paddingLeft: 'clamp(16px, 5vw, 80px)', paddingRight: 'clamp(16px, 5vw, 80px)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4" style={{ gap: 'clamp(24px, 3vw, 48px)', marginBottom: 'clamp(40px, 5vw, 80px)' }}>
            <div className="col-span-1 sm:col-span-2 md:col-span-2">
              <Link href="/" className="font-black tracking-tighter text-white block" style={{ fontSize: 'clamp(24px, 2.5vw, 40px)', marginBottom: 'clamp(12px, 1.5vw, 24px)' }}>
                CRAYZEE<span className="text-[#fb5607]">.IN</span>
              </Link>
              <p className="text-zinc-400 font-medium leading-relaxed" style={{ maxWidth: 'clamp(280px, 30vw, 400px)', fontSize: 'clamp(11px, 0.9vw, 16px)', marginBottom: 'clamp(20px, 2.5vw, 40px)' }}>
                India's wildest streetwear label. We don't just sell clothes, we drop vibes. Built for the rebels, the dreamers, and the ones who never blend in.
              </p>
              <div className="flex" style={{ gap: 'clamp(8px, 0.8vw, 16px)' }}>
                <a href="https://www.instagram.com/crayzee.in?igsh=MXQzNjF3cDE3bmpoZA==" target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-white/5 flex items-center justify-center hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] transition-all cursor-pointer group" style={{ width: 'clamp(36px, 3vw, 48px)', height: 'clamp(36px, 3vw, 48px)' }}>
                  <Instagram className="text-white group-hover:scale-110 transition-transform" style={{ width: 'clamp(14px, 1.1vw, 18px)', height: 'clamp(14px, 1.1vw, 18px)' }} />
                </a>
                <a href="https://mail.google.com/mail/?view=cm&to=crayzee.in@gmail.com" target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#fb5607] transition-all cursor-pointer group" style={{ width: 'clamp(36px, 3vw, 48px)', height: 'clamp(36px, 3vw, 48px)' }}>
                  <Mail className="text-white group-hover:scale-110 transition-transform" style={{ width: 'clamp(14px, 1.1vw, 18px)', height: 'clamp(14px, 1.1vw, 18px)' }} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-[0.2em] text-zinc-500" style={{ fontSize: 'clamp(9px, 0.7vw, 12px)', marginBottom: 'clamp(16px, 2vw, 32px)' }}>Quick Links</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1vw, 16px)' }}>
                <li><Link href="/browse" className="font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest" style={{ fontSize: 'clamp(10px, 0.8vw, 14px)' }}>Shop All</Link></li>
                <li><Link href="/orders" className="font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest" style={{ fontSize: 'clamp(10px, 0.8vw, 14px)' }}>Track Order</Link></li>
                <li><Link href="/profile" className="font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest" style={{ fontSize: 'clamp(10px, 0.8vw, 14px)' }}>My Account</Link></li>
                <li><Link href="/wishlist" className="font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest" style={{ fontSize: 'clamp(10px, 0.8vw, 14px)' }}>Wishlist</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-[0.2em] text-zinc-500" style={{ fontSize: 'clamp(9px, 0.7vw, 12px)', marginBottom: 'clamp(16px, 2vw, 32px)' }}>The Vibe</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1vw, 16px)' }}>
                <li><Link href="/privacy-policy" className="font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest" style={{ fontSize: 'clamp(10px, 0.8vw, 14px)' }}>Privacy Policy</Link></li>
                <li><Link href="/contact" className="font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest" style={{ fontSize: 'clamp(10px, 0.8vw, 14px)' }}>Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 flex flex-col md:flex-row justify-between items-center" style={{ paddingTop: 'clamp(16px, 2vw, 32px)', gap: 'clamp(12px, 1.5vw, 24px)' }}>
            <p className="text-zinc-600 font-bold uppercase tracking-widest" style={{ fontSize: 'clamp(7px, 0.55vw, 9px)' }}>© 2026 CRAYZEE STREETWEAR CO. MADE IN INDIA 🇮🇳</p>
            <div className="flex items-center opacity-30 invert" style={{ gap: 'clamp(12px, 1.5vw, 24px)' }}>
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
