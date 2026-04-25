'use client';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg"
        >
          <div className="text-[120px] sm:text-[160px] font-bold leading-none tracking-tighter text-zinc-200 dark:text-zinc-800 select-none mb-[-20px]">
            404
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-zinc-900 dark:text-white">
            Page not found
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mb-8 max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto inline-flex items-center justify-center bg-[#fb5607] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#e04e06] transition-all">
              Go Home
            </Link>
            <Link href="/browse" className="w-full sm:w-auto inline-flex items-center justify-center border border-zinc-200 dark:border-zinc-700 px-8 py-3 rounded-xl font-semibold text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
              Browse Products
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
