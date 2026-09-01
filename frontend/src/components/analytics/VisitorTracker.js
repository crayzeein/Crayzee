'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import API from '@/utils/api';

// Generate a random UUID-like string for anonymous visitor tracking
const getOrCreateVisitorId = () => {
  if (typeof window === 'undefined') return null;
  let vid = localStorage.getItem('crayzee_vid');
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('crayzee_vid', vid);
  }
  return vid;
};

// Detect device category
const getDeviceType = () => {
  if (typeof window === 'undefined') return 'unknown';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef(null);

  useEffect(() => {
    // Avoid duplicate pings on same path render
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    // Do not track admin panel visits to avoid polluting visitor stats
    if (pathname.startsWith('/admin')) return;

    const visitorId = getOrCreateVisitorId();
    if (!visitorId) return;

    const deviceType = getDeviceType();
    const referrer = typeof document !== 'undefined' ? (document.referrer || 'Direct') : 'Direct';

    // Send analytics beacon / ping in background
    const timeout = setTimeout(() => {
      API.post('/analytics/visit', {
        visitorId,
        path: pathname,
        referrer,
        deviceType
      }).catch(() => {
        // Silently ignore analytics network errors
      });
    }, 800);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
