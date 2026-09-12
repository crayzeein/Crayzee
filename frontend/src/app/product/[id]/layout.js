export { default } from '@/components/layout/PassThrough';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Each product ranks on its own name rather than the shared site title
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await fetch(`${API}/products/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Product not found');
    const product = await res.json();
    const image = product.images?.[0]?.url;
    return {
      title: product.name,
      description: product.description?.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.description?.slice(0, 160),
        images: image ? [image] : []
      }
    };
  } catch {
    return { title: 'Product', robots: { index: false } };
  }
}
