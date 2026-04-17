'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import API from '@/utils/api';

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(1);

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

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent(prev => slides.length ? (prev + 1) % slides.length : prev);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrent(prev => slides.length ? (prev === 0 ? slides.length - 1 : prev - 1) : prev);
  }, [slides.length]);

  // Auto-play every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [slides.length, nextSlide]);

  if (loading) return (
    <div className="hero-section hero-loading-state">
      <div className="hero-loading-content">
        <div className="hero-loading-shimmer" />
        <div className="hero-loading-shimmer hero-loading-shimmer--short" />
        <div className="hero-loading-shimmer hero-loading-shimmer--btn" />
      </div>
      <div className="hero-loading-image-area" />
    </div>
  );

  if (!slides.length) return null;



  return (
    <section className="hero-section">
      {/* Decorative background elements */}
      <div className="hero-bg-pattern" />
      <div className="hero-bg-gradient" />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="hero-inner"
        >
          {/* LEFT SIDE - Text Content */}
          <div className="hero-text-side">
            <div className="hero-text-content">
              {/* Badge */}
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="hero-badge"
              >
                <span className="hero-badge-dot" />
                {slides[current].badge}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="hero-title"
              >
                {slides[current].title1}
                <br />
                <span className="hero-title-accent">{slides[current].title2}</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="hero-subtitle"
              >
                {slides[current].subtitle}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="hero-actions"
              >
                <Link href={slides[current].link} className="hero-btn-primary">
                  Explore Collection
                  <ArrowRight className="hero-btn-arrow" />
                </Link>
                <Link href="/browse" className="hero-btn-secondary">
                  View All Drops
                </Link>
              </motion.div>


            </div>
          </div>

          {/* RIGHT SIDE - Image */}
          <div className="hero-image-side">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="hero-image-container"
            >
              <Image
                src={slides[current].image}
                alt={slides[current].title1}
                width={600}
                height={600}
                priority
                className="hero-image"
                unoptimized
              />
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls - Bottom */}
      {slides.length > 1 && (
        <div className="hero-bottom-nav">
          {/* Progress Dots */}
          <div className="hero-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className={`hero-dot ${i === current ? 'hero-dot--active' : ''}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Arrow Controls */}
          <div className="hero-arrows">
            <button onClick={prevSlide} className="hero-arrow-btn" aria-label="Previous">
              <ChevronLeft className="hero-arrow-icon" />
            </button>
            <button onClick={nextSlide} className="hero-arrow-btn" aria-label="Next">
              <ChevronRight className="hero-arrow-icon" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
