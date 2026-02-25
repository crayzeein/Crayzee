'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-zinc-100 dark:bg-zinc-950">
      {/* Background Shapes */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-[#fb5607]/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute top-40 -right-20 w-72 h-72 bg-white/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-20 w-72 h-72 bg-[#fb5607]/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-xs md:text-sm font-black text-[#fb5607] uppercase tracking-[0.4em] mb-6">
            New Drop: Street Legends 2026 🚀
          </h2>
          <h1 className="text-6xl md:text-9xl font-black mb-8 leading-[0.9] tracking-tighter text-zinc-900 dark:text-white">
            BE BOLD. <br /> BE <span className="text-[#fb5607]">CRAYZEE.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 text-lg md:text-2xl mb-12 font-medium leading-relaxed">
            Streetwear that speaks your language. Premium quality, trend-setting designs, and the ultimate comfort. Built for the rebels.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/browse" className="bg-[#fb5607] text-white px-10 py-5 rounded-[18px] font-black text-xs uppercase tracking-[0.2em] hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#fb5607]/20">
              Shop Now
            </Link>
            <Link href="/browse?category=Anime" className="bg-white dark:bg-white/5 text-zinc-900 dark:text-white px-10 py-5 rounded-[18px] border border-zinc-200 dark:border-white/10 font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-50 dark:hover:bg-white/10 transition-all active:scale-95">
              Anime Collection
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-1 h-12 rounded-full bg-gradient-to-b from-[#fb5607] to-transparent"></div>
      </div>
    </section>
  );
}
