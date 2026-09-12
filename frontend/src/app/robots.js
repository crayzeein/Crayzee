const BASE = 'https://www.crayzee.in';

// Account and checkout routes also carry a noindex tag, which is what deindexes them
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/']
    },
    sitemap: `${BASE}/sitemap.xml`
  };
}
