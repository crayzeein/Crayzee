'use client';
import { motion } from 'framer-motion';

export default function BrandLoader({ size = 'md' }) {
  const sizes = { sm: 36, md: 48, lg: 56 };
  const s = sizes[size] || sizes.md;
  const box = s + 32;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: [-8, 8, -8] }}
      exit={{ opacity: 0 }}
      transition={{ y: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.2 } }}
      className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl flex items-center justify-center"
      style={{ width: box, height: box }}
    >
      <img src="/logo.png" alt="" style={{ width: s, height: s }} className="object-contain" />
    </motion.div>
  );
}

// Fixed overlay — always center of screen, like Bewakoof
export function BrandLoaderOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-zinc-950/50 backdrop-blur-[3px]"
    >
      <BrandLoader size="md" />
    </motion.div>
  );
}
