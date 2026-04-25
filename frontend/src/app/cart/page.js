'use client';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/layout/Navbar';
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import API from '@/utils/api';
import BrandLoader from '@/components/ui/BrandLoader';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQty, setCart, user, _hasHydrated } = useStore();
  const router = useRouter();
  const [stockStatus, setStockStatus] = useState({}); // { id: { stock, message } }
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    if (_hasHydrated && !user) {
      router.push('/login?redirect=/cart');
      return;
    }

    if (!_hasHydrated || !user) return;

    const validateStock = async () => {
      if (cart.length === 0) {
        setValidating(false);
        return;
      }

      setValidating(true);
      try {
        const validatedCart = [...cart];
        const status = {};
        let changed = false;

        for (const item of validatedCart) {
          const { data: product } = await API.get(`/products/${item._id}`);
          status[item._id] = { stock: product.stock };

          if (product.stock === 0) {
            status[item._id].message = "Out of Stock";
          } else if (item.qty > product.stock) {
            item.qty = product.stock;
            status[item._id].message = `Adjusted to max available (${product.stock})`;
            changed = true;
          }
        }

        if (changed) {
          setCart(validatedCart);
        }
        setStockStatus(status);
      } catch (error) {
        console.error("Stock validation failed", error);
      } finally {
        setValidating(false);
      }
    };

    validateStock();
  }, [user, router]); // Removed cart and setCart from dependencies to avoid loop

  const subtotal = cart.reduce((total, item) => total + item.price * item.qty, 0);
  const isCartInvalid = cart.some(item => {
    const s = stockStatus[item._id];
    return s && (s.stock === 0 || item.qty > s.stock);
  });
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const updateQty = (item, delta) => {
    const currentStock = stockStatus[item._id]?.stock ?? 999;
    const newQty = item.qty + delta;
    if (newQty > 0 && newQty <= currentStock) {
      updateCartQty(item.cartItemId, newQty);
    }
  };

  if (!user) return null;

  if (validating) return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <div className="pt-32 flex items-center justify-center"><BrandLoader size="lg" /></div>
    </main>
  );

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <div className="w-full max-w-[1920px] mx-auto pt-28 pb-20" style={{ paddingLeft: 'clamp(16px, 4vw, 64px)', paddingRight: 'clamp(16px, 4vw, 64px)' }}>
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-zinc-100 dark:border-zinc-800">
              <ShoppingBag size={32} className="text-[#fb5607]" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-white">Your bag is empty</h2>
            <p className="text-zinc-400 text-sm mb-8">Looks like you haven't added anything yet.</p>
            <Link href="/browse" className="inline-block bg-[#fb5607] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#e04e06] transition-all">
              Start Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <div className="w-full max-w-[1920px] mx-auto pt-24 pb-20" style={{ paddingLeft: 'clamp(16px, 4vw, 64px)', paddingRight: 'clamp(16px, 4vw, 64px)' }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Shopping Bag</h1>
          <p className="text-sm text-zinc-400 mt-1">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.cartItemId} className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl flex gap-4 sm:gap-5 items-start border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-shadow">
                <div className="w-24 h-28 sm:w-28 sm:h-32 relative rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                  <Link href={`/product/${item._id}`}>
                    {(item.images?.[0]?.url || item.image) ? (
                      <Image
                        src={item.images?.[0]?.url || item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[10px]">
                        No Image
                      </div>
                    )}
                  </Link>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link href={`/product/${item._id}`}>
                      <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white hover:text-[#fb5607] transition-colors capitalize line-clamp-2">{item.name}</h3>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {item.category && <span className="text-[10px] font-medium text-zinc-400 uppercase">{item.category}</span>}
                    {item.selectedSize && (
                      <span className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">
                        Size: {item.selectedSize}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0">
                      <button onClick={() => updateQty(item, -1)} disabled={item.qty <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-l-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-20">
                        <Minus size={14} />
                      </button>
                      <span className="w-10 h-8 flex items-center justify-center border-t border-b border-zinc-200 dark:border-zinc-700 font-semibold text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item, 1)} disabled={item.qty >= (stockStatus[item._id]?.stock ?? 0)}
                        className="w-8 h-8 flex items-center justify-center rounded-r-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-20">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-lg font-bold text-zinc-900 dark:text-white">₹{item.price * item.qty}</span>
                  </div>
                  {stockStatus[item._id]?.message && (
                    <div className="flex items-center gap-1.5 mt-2 text-[#fb5607] text-[10px] font-semibold">
                      <AlertCircle size={12} /> {stockStatus[item._id].message}
                    </div>
                  )}
                </div>
                <button onClick={() => removeFromCart(item.cartItemId)}
                  className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 transition-colors shrink-0 mt-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl sticky top-24 border border-zinc-100 dark:border-zinc-800">
              <h2 className="text-lg font-bold mb-6 text-zinc-900 dark:text-white">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-green-500' : 'text-zinc-900 dark:text-white'}`}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-zinc-400">Free shipping on orders above ₹1500</p>
                )}
                <hr className="border-zinc-100 dark:border-zinc-800" />
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-zinc-500">Total</span>
                  <span className="text-2xl font-bold text-[#fb5607]">₹{total}</span>
                </div>
              </div>
              <button
                onClick={() => router.push('/checkout')}
                disabled={isCartInvalid || validating || cart.length === 0}
                className="w-full py-3.5 rounded-xl bg-[#fb5607] text-white font-semibold text-sm uppercase tracking-wider hover:bg-[#e04e06] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validating ? 'Checking...' : isCartInvalid ? 'Stock Issue' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
