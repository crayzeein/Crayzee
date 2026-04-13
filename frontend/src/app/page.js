'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroCarousel from '@/components/layout/HeroCarousel';
import ProductCard from '@/components/product/ProductCard';
import API from '@/utils/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Zap, Flame, Crown, ArrowRight, Star, Instagram, Mail } from 'lucide-react';

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


      {/* 3️⃣ New Arrivals */}
      <section className="py-24 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#fb5607] font-black text-[10px] uppercase tracking-widest mb-4">
                <Zap size={14} className="fill-[#fb5607]" /> Fresh Out the Lab
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">New <span className="text-[#fb5607]">Arrivals</span></h2>
            </div>
            <Link href="/browse?sort=newest" className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-all">
              See the full drop <div className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-[#fb5607] group-hover:text-white group-hover:border-[#fb5607] transition-all"><ArrowRight size={16} /></div>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-[40px]" />
              ))
            ) : (
              newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4️⃣ Trending Featured Section */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900/40 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="flex items-center gap-2 text-[#fb5607] font-black text-[10px] uppercase tracking-widest mb-4">
                <Flame size={14} className="fill-[#fb5607]" /> Top Rated Vibe
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">Trending <span className="text-[#fb5607]">Drops</span></h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-[40px]" />
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
      <footer className="bg-zinc-950 text-white pt-24 pb-12 rounded-t-[32px] md:rounded-t-[64px]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 sm:col-span-2 md:col-span-2">
              <Link href="/" className="text-4xl font-black tracking-tighter text-white mb-6 block">CRAYZEE<span className="text-[#fb5607]">.IN</span></Link>
              <p className="max-w-md text-zinc-400 font-medium leading-relaxed mb-10">
                India's wildest streetwear label. We don't just sell clothes, we drop vibes. Built for the rebels, the dreamers, and the ones who never blend in.
              </p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/crayzee.in?igsh=MXQzNjF3cDE3bmpoZA==" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] transition-all cursor-pointer group">
                  <Instagram size={18} className="text-white group-hover:scale-110 transition-transform" />
                </a>
                <a href="https://mail.google.com/mail/?view=cm&to=crayzee.in@gmail.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#fb5607] transition-all cursor-pointer group">
                  <Mail size={18} className="text-white group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-[0.2em] text-xs mb-8 text-zinc-500">Quick Links</h4>
              <ul className="space-y-4">
                <li><Link href="/browse" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">Shop All</Link></li>
                <li><Link href="/orders" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">Track Order</Link></li>
                <li><Link href="/profile" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">My Account</Link></li>
                <li><Link href="/wishlist" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">Wishlist</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-[0.2em] text-xs mb-8 text-zinc-500">The Vibe</h4>
              <ul className="space-y-4">
                <li><Link href="/privacy-policy" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">Privacy Policy</Link></li>
                <li><Link href="/contact" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-zinc-600 font-bold uppercase text-[9px] tracking-widest">© 2026 CRAYZEE STREETWEAR CO. MADE IN INDIA 🇮🇳</p>
            <div className="flex items-center gap-6 opacity-30 invert">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
