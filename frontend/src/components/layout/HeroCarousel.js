'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import API from '@/utils/api';

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await API.get('/banners');

        if (data && data.length > 0) {
          const formattedSlides = data.map(banner => ({
            id: banner._id,
            badge: banner.badge,
            title1: banner.title1,
            title2: banner.title2,
            subtitle: banner.subtitle,
            image: banner.image,
            link: banner.link
          }));
          setSlides(formattedSlides);
        } else {
          // Fallback if no banners are seeded
          const res = await API.get('/products?isFeatured=true&limit=3');
          const formattedFallback = res.data.products.map(p => ({
            id: p._id,
            badge: 'Featured Drop',
            title1: (p.name || 'CRAYZEE').split(' ')[0],
            title2: (p.name || '').split(' ').slice(1).join(' ') || 'COLLECTION',
            subtitle: p.description && p.description.length > 120 ? p.description.substring(0, 117) + '...' : (p.description || "India's wildest streetwear drop. Limited edition essentials."),
            image: p.images?.[0]?.url || p.image,
            link: `/product/${p._id}`
          }));
          setSlides(formattedFallback);
        }
      } catch (error) {
        console.error('Error fetching hero banners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const nextSlide = () => setCurrent(prev => slides.length ? (prev + 1) % slides.length : prev);
  const prevSlide = () => setCurrent(prev => slides.length ? (prev === 0 ? slides.length - 1 : prev - 1) : prev);

  if (loading) return (
    <div className="h-[500px] md:h-[calc(100vh-80px)] bg-zinc-100 dark:bg-zinc-900 animate-pulse flex items-center justify-center">
      <div className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">Loading Drops...</div>
    </div>
  );

  if (!slides.length) return null;

  return (
    <section className="relative min-h-[500px] md:h-[calc(100vh-80px)] overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="h-full w-full"
        >
          <div className="container mx-auto px-4 h-full flex flex-col md:flex-row items-center">
            {/* Left Column: Text Content */}
            <div className="w-full md:w-1/2 pt-12 pb-8 md:py-0 z-10 text-center md:text-left">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fb5607]/10 text-[#fb5607] text-[10px] font-black uppercase tracking-[0.2em]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#fb5607] animate-pulse" />
                {slides[current].badge}
              </motion.div>

              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-6xl lg:text-8xl font-black text-zinc-900 dark:text-white leading-[0.9] tracking-tighter mb-6"
              >
                {slides[current].title1} <br />
                <span className="text-[#fb5607]">{slides[current].title2}</span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-zinc-600 dark:text-zinc-400 text-sm md:text-lg lg:text-xl font-medium max-w-lg mb-10 leading-relaxed mx-auto md:mx-0"
              >
                {slides[current].subtitle}
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
              >
                <Link
                  href={slides[current].link}
                  className="bg-[#fb5607] text-white px-10 py-5 rounded-[18px] font-black text-xs uppercase tracking-[0.1em] hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#fb5607]/20 flex items-center gap-3 group"
                >
                  Explore Collection <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/browse"
                  className="bg-white dark:bg-white/5 text-zinc-950 dark:text-white px-10 py-5 rounded-[18px] border border-zinc-200 dark:border-white/10 font-bold text-xs uppercase tracking-[0.1em] hover:bg-zinc-50 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                  View All Drops
                </Link>
              </motion.div>
            </div>

            {/* Right Column: Visual Component */}
            <div className="w-full md:w-1/2 h-[400px] lg:h-[600px] relative py-8 md:py-12 lg:py-16 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, rotate: 2 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative h-full w-full max-w-md lg:max-w-lg rounded-[40px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)]"
              >
                <Image
                  src={slides[current].image}
                  alt={slides[current].title1}
                  fill
                  priority
                  className="object-cover object-top transition-transform duration-[20s] hover:scale-110"
                  unoptimized
                />
              </motion.div>

              {/* Floating Badge */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-4 md:bottom-24 -left-4 md:-left-12 bg-white dark:bg-zinc-900 p-6 rounded-[24px] shadow-2xl border border-zinc-100 dark:border-white/5 z-20 hidden sm:block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#fb5607] rounded-xl flex items-center justify-center text-white">
                    <ArrowRight size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-tighter">Fast Drops</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">New Styles Daily</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 right-4 md:right-12 flex items-center gap-4 z-20">
        <button
          onClick={prevSlide}
          className="p-4 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white hover:bg-[#fb5607] hover:text-white transition-all shadow-xl"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="p-4 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white hover:bg-[#fb5607] hover:text-white transition-all shadow-xl"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-10 bg-[#fb5607]' : 'w-4 bg-zinc-300 dark:bg-zinc-700'}`}
          />
        ))}
      </div>
    </section>
  );
}
