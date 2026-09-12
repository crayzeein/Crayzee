const BASE = 'https://www.crayzee.in';

// Next.js generates /sitemap.xml from this at build time
export default function sitemap() {
  const now = new Date();
  const routes = [
    ['', 1.0, 'daily'],
    ['/browse', 0.9, 'daily'],
    ['/men', 0.8, 'weekly'],
    ['/women', 0.8, 'weekly'],
    ['/contact', 0.4, 'monthly'],
    ['/privacy-policy', 0.3, 'yearly'],
    ['/terms', 0.3, 'yearly'],
    ['/refund-policy', 0.3, 'yearly'],
    ['/shipping-policy', 0.3, 'yearly']
  ];

  return routes.map(([path, priority, changeFrequency]) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency,
    priority
  }));
}
