'use client';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TryOnButton({ onClick, category }) {
  // Only show for clothing
  if (category && !['clothing', 'fashion'].includes(category.toLowerCase())) {
    return null;
  }

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      {/* Outer animated glow — warm orange matching site theme */}
      <div
        className="absolute -inset-[2px] rounded-2xl opacity-0 group-hover:opacity-50 blur-lg transition-all duration-700"
        style={{
          background: 'linear-gradient(135deg, #fb5607, #ff7b3a, #fb5607)',
        }}
      />

      {/* Main button card */}
      <motion.button
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full rounded-2xl cursor-pointer overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-[#fb5607]/40 transition-all duration-300"
      >
        {/* Inner content container */}
        <div className="relative flex items-center justify-between px-4 py-3.5">
          {/* Left side */}
          <div className="flex items-center gap-3">
            {/* Animated icon container */}
            <div className="relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #fb5607 0%, #ff8a3d 100%)',
                }}
              >
                <Sparkles
                  size={17}
                  className="text-white"
                  style={{ animation: 'sparkleFloat 2.5s ease-in-out infinite' }}
                />
              </div>
              {/* Live ping dot */}
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-white dark:border-zinc-900" />
              </span>
            </div>

            {/* Text */}
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-zinc-800 dark:text-white tracking-wide">
                  Try On with AI
                </span>
                <span
                  className="text-[7px] font-extrabold px-1.5 py-[2px] rounded-full uppercase tracking-widest text-white"
                  style={{ background: '#fb5607' }}
                >
                  New
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">
                See how it looks on you ✨
              </span>
            </div>
          </div>

          {/* Right side arrow */}
          <div className="flex items-center text-zinc-300 dark:text-zinc-600 group-hover:text-[#fb5607] group-hover:translate-x-0.5 transition-all duration-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
        </div>

        {/* Subtle shimmer sweep on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(251,86,7,0.04) 45%, rgba(251,86,7,0.08) 50%, rgba(251,86,7,0.04) 55%, transparent 60%)',
            animation: 'shimmerSweep 2.5s ease-in-out infinite',
          }}
        />

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-[15%] right-[15%] h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: 'linear-gradient(90deg, transparent, #fb5607, transparent)' }}
        />
      </motion.button>

      <style jsx>{`
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes sparkleFloat {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(8deg) scale(1.12); }
        }
      `}</style>
    </div>
  );
}
