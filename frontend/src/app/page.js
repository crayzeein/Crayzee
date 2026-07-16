'use client';
import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroCarousel from '@/components/layout/HeroCarousel';
import ProductCard from '@/components/product/ProductCard';
import API from '@/utils/api';
import Link from 'next/link';
import { ChevronRight, Zap, Flame, ArrowRight, Instagram, Mail, Truck, Shield, RefreshCw, Headphones, ChevronLeft, Lock } from 'lucide-react';

/* Shared header so every section keeps the same rhythm */
function SectionHeader({ icon: Icon, eyebrow, title, accent, href }) {
  return (
    <div
      className="flex flex-col md:flex-row md:items-end justify-between"
      style={{ marginBottom: 'var(--header-gap)', gap: 'clamp(8px, 1vw, 16px)' }}
    >
      <div>
        <div
          className="flex items-center text-[#fb5607] font-semibold uppercase tracking-[0.15em]"
          style={{ gap: 'clamp(6px, 0.5vw, 10px)', fontSize: 'clamp(9px, 0.7vw, 11px)', marginBottom: 'clamp(6px, 0.8vw, 10px)' }}
        >
          <Icon className="fill-[#fb5607]" style={{ width: 'clamp(11px, 0.9vw, 14px)', height: 'clamp(11px, 0.9vw, 14px)' }} /> {eyebrow}
        </div>
        <h2 className="font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.1]" style={{ fontSize: 'clamp(22px, 2.5vw, 40px)' }}>
          {title} <span className="text-[#fb5607]">{accent}</span>
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group flex items-center text-zinc-500 hover:text-[#fb5607] transition-all shrink-0"
          style={{ gap: 'clamp(6px, 0.6vw, 10px)', fontSize: 'clamp(10px, 0.8vw, 13px)', fontWeight: 600 }}
        >
          View All
          <ArrowRight className="group-hover:translate-x-1 transition-transform" style={{ width: 'clamp(12px, 1vw, 16px)', height: 'clamp(12px, 1vw, 16px)' }} />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef1 = useRef(null);

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

      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* 2. Trust Badges */}
      <section className="border-b border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-[1920px] mx-auto" style={{ padding: 'clamp(18px, 2.2vw, 32px) var(--page-x)' }}>
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--card-gap)' }}>
            {[
              { icon: Truck, label: 'Free Shipping', sub: 'Orders above ₹1500' },
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

      {/* 3. New Arrivals — Horizontal Scroll */}
      <section className="bg-white dark:bg-zinc-950" style={{ padding: 'var(--section-y) 0' }}>
        <div className="w-full max-w-[1920px] mx-auto" style={{ paddingLeft: 'var(--page-x)', paddingRight: 'var(--page-x)' }}>
          <SectionHeader icon={Zap} eyebrow="Just Dropped" title="New" accent="Arrivals" href="/browse?sort=newest" />

          <div className="relative group/scroll">
            {/* Left Arrow */}
            <button onClick={() => scroll(scrollRef1, 'left')} aria-label="Scroll left"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 shadow-lg hover:bg-[#fb5607] hover:text-white hover:border-[#fb5607] active:scale-90 transition-all md:opacity-0 md:group-hover/scroll:opacity-100"
              style={{ marginLeft: '-4px' }}>
              <ChevronLeft size={18} />
            </button>

            {/* Right Arrow */}
            <button onClick={() => scroll(scrollRef1, 'right')} aria-label="Scroll right"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 shadow-lg hover:bg-[#fb5607] hover:text-white hover:border-[#fb5607] active:scale-90 transition-all md:opacity-0 md:group-hover/scroll:opacity-100"
              style={{ marginRight: '-4px' }}>
              <ChevronRight size={18} />
            </button>

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
        </div>
      </section>

      {/* 4. Trending Drops — Grid */}
      <section className="bg-zinc-50 dark:bg-zinc-900/30" style={{ padding: 'var(--section-y) 0' }}>
        <div className="w-full max-w-[1920px] mx-auto" style={{ paddingLeft: 'var(--page-x)', paddingRight: 'var(--page-x)' }}>
          <SectionHeader icon={Flame} eyebrow="Trending Now" title="Trending" accent="Collection" href="/browse" />

          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--card-gap)' }}>
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

      {/* 5. Footer */}
      <footer className="bg-zinc-950 text-white border-t border-white/5" style={{ paddingTop: 'var(--section-y)', paddingBottom: 'clamp(20px, 2.5vw, 36px)' }}>
        <div className="w-full max-w-[1920px] mx-auto" style={{ paddingLeft: 'var(--page-x)', paddingRight: 'var(--page-x)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4" style={{ gap: 'clamp(24px, 3vw, 40px)', marginBottom: 'var(--section-y)' }}>
            {/* Brand */}
            <div className="col-span-1 sm:col-span-2 md:col-span-2">
              <Link href="/" className="font-bold tracking-tight text-white block" style={{ fontSize: 'clamp(22px, 2.2vw, 36px)', marginBottom: 'clamp(14px, 1.8vw, 24px)' }}>
                CRAYZEE<span className="text-[#fb5607]">.IN</span>
              </Link>
              <p className="text-zinc-500 font-normal leading-relaxed" style={{ maxWidth: 'clamp(280px, 30vw, 400px)', fontSize: 'clamp(12px, 0.95vw, 15px)', marginBottom: 'clamp(20px, 2.5vw, 36px)' }}>
                India's favourite streetwear destination. Premium quality, bold designs, and styles that make you stand out. Made for those who dare to be different.
              </p>
              <div className="flex" style={{ gap: 'clamp(8px, 0.8vw, 14px)' }}>
                <a href="https://www.instagram.com/crayzee.in?igsh=MXQzNjF3cDE3bmpoZA==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-xl bg-white/5 flex items-center justify-center hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] transition-all cursor-pointer group" style={{ width: 'clamp(38px, 3vw, 48px)', height: 'clamp(38px, 3vw, 48px)' }}>
                  <Instagram className="text-zinc-400 group-hover:text-white transition-colors" style={{ width: 'clamp(15px, 1.1vw, 18px)', height: 'clamp(15px, 1.1vw, 18px)' }} />
                </a>
                <a href="https://mail.google.com/mail/?view=cm&to=crayzee.in@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Email" className="rounded-xl bg-white/5 flex items-center justify-center hover:bg-[#fb5607] transition-all cursor-pointer group" style={{ width: 'clamp(38px, 3vw, 48px)', height: 'clamp(38px, 3vw, 48px)' }}>
                  <Mail className="text-zinc-400 group-hover:text-white transition-colors" style={{ width: 'clamp(15px, 1.1vw, 18px)', height: 'clamp(15px, 1.1vw, 18px)' }} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold uppercase tracking-[0.2em] text-zinc-500" style={{ fontSize: 'clamp(9px, 0.7vw, 11px)', marginBottom: 'var(--header-gap)' }}>Quick Links</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.2vw, 18px)' }}>
                <li><Link href="/browse" className="font-medium text-zinc-400 hover:text-white transition-colors" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>Shop All</Link></li>
                <li><Link href="/orders" className="font-medium text-zinc-400 hover:text-white transition-colors" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>Track Order</Link></li>
                <li><Link href="/profile" className="font-medium text-zinc-400 hover:text-white transition-colors" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>My Account</Link></li>
                <li><Link href="/wishlist" className="font-medium text-zinc-400 hover:text-white transition-colors" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>Wishlist</Link></li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="font-bold uppercase tracking-[0.2em] text-zinc-500" style={{ fontSize: 'clamp(9px, 0.7vw, 11px)', marginBottom: 'var(--header-gap)' }}>Info</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.2vw, 18px)' }}>
                <li><Link href="/privacy-policy" className="font-medium text-zinc-400 hover:text-white transition-colors" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>Privacy Policy</Link></li>
                <li><Link href="/contact" className="font-medium text-zinc-400 hover:text-white transition-colors" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>Contact Us</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/5 flex flex-col md:flex-row justify-between items-center" style={{ paddingTop: 'clamp(18px, 2.2vw, 32px)', gap: 'clamp(12px, 1.5vw, 24px)' }}>
            <p className="text-zinc-600 font-medium order-2 md:order-1" style={{ fontSize: 'clamp(9px, 0.7vw, 11px)', letterSpacing: '0.08em' }}>© 2026 CRAYZEE.IN — All rights reserved. Made in India 🇮🇳</p>

            {/* Payment methods we actually accept (Razorpay) */}
            <div className="flex items-center flex-wrap justify-center order-1 md:order-2" style={{ gap: 'clamp(6px, 0.6vw, 10px)' }}>
              <span className="flex items-center gap-1.5 text-zinc-500" style={{ fontSize: 'clamp(8px, 0.65vw, 10px)' }}>
                <Lock style={{ width: '10px', height: '10px' }} /> Secure payments
              </span>
              {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking'].map((m) => (
                <span key={m} className="rounded-md bg-white/5 border border-white/5 text-zinc-400 font-medium" style={{ fontSize: 'clamp(8px, 0.65vw, 10px)', padding: '4px 8px' }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}