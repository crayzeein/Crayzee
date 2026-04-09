'use client';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <main className="min-h-screen border-8 border-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <Navbar />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[18rem] lg:text-[25rem] font-black leading-none tracking-tighter text-zinc-950 select-none opacity-5">
          404
        </h1>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-6">
          <h2 className="text-5xl md:text-8xl font-black mb-6 uppercase tracking-tighter leading-none">
            YOU LOST <br /> THE <span className="text-[#fb5607] underline decoration-8">VIBE?</span>
          </h2>
          <p className="text-sm sm:text-lg md:text-2xl text-zinc-500 font-bold mb-10 uppercase tracking-widest leading-relaxed">
            This page doesn't exist in the crayzee universe. <br /> Let's get you back to reality.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/" className="btn-primary w-full sm:w-auto text-lg !px-12 !py-5 shadow-2xl">
              GO BACK HOME
            </Link>
            <Link href="/browse" className="btn-outline w-full sm:w-auto text-lg !px-12 !py-5 border-zinc-950 text-zinc-950 hover:bg-zinc-950">
              SHOP TRENDS
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Aesthetic Blobs */}
      <div className="fixed -top-20 -left-20 w-96 h-96 bg-[#fb5607] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="fixed -bottom-20 -right-20 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
    </main>
  );
}
