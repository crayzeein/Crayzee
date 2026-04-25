'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import API from '@/utils/api';

// Professional static banners — always look great on all screen sizes
const STATIC_BANNERS = [
  {
    id: 'static-1',
    badge: 'Limited Drop',
    title1: 'URBAN',
    title2: 'REVOLUTION',
    subtitle: "India's wildest streetwear drop is here. High-octane aesthetics for the rule breakers.",
    image: '/banners/hero-urban.png',
    link: '/browse',
  },
  {
    id: 'static-2',
    badge: 'Techwear',
    title1: 'CYBER',
    title2: 'CORE 2026',
    subtitle: 'Step into the future with our tech-wear inspired series. Functional. Fearless. Futuristic.',
    image: '/banners/hero-techwear.png',
    link: '/browse',
  },
  {
    id: 'static-3',
    badge: 'Oversized',
    title1: 'STREET',
    title2: 'LEGENDS',
    subtitle: 'The classic oversized collection. Crafted for maximum comfort and ultimate street cred.',
    image: '/banners/hero-oversized.png',
    link: '/browse',
  },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState(STATIC_BANNERS);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1);

  // NOTE: Static banners are used for now since they are designed for full-bleed cinematic layout.
  // When you upload proper wide-format banners from Admin panel, uncomment below to use API banners.
  //
  // useEffect(() => {
  //   const fetchBanners = async () => {
  //     try {
  //       const { data } = await API.get('/banners');
  //       if (data && data.length > 0) {
  //         const formattedSlides = data.map(banner => ({
  //           id: banner._id, badge: banner.badge, title1: banner.title1,
  //           title2: banner.title2, subtitle: banner.subtitle,
  //           image: banner.image, link: banner.link
  //         }));
  //         setSlides(formattedSlides);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching hero banners:', error);
  //     }
  //   };
  //   fetchBanners();
  // }, []);

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

  if (!slides.length) return null;

  return (
    <section className="hero-section">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="hero-slide"
        >
          {/* Full-bleed Background Image */}
          <div className="hero-img-wrap">
            <Image
              src={slides[current].image}
              alt={slides[current].title1}
              fill
              priority
              className="hero-img"
              unoptimized
              sizes="100vw"
            />
            {/* Cinematic dark overlay */}
            <div className="hero-overlay" />
          </div>

          {/* Text Content - Bottom Left */}
          <div className="hero-content">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="hero-badge"
            >
              <span className="hero-badge-dot" />
              {slides[current].badge}
            </motion.div>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="hero-title"
            >
              {slides[current].title1}
              <br />
              <span className="hero-title-accent">{slides[current].title2}</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="hero-subtitle"
            >
              {slides[current].subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
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
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <div className="hero-nav">
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
