'use client';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/layout/Navbar';
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import API from '@/utils/api';

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

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <div className="pt-40 container mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
            <ShoppingBag size={40} className="text-[#fb5607]" />
          </div>
          <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-zinc-900 dark:text-white">Your bag is empty!</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold mb-10 max-w-sm mx-auto uppercase text-xs tracking-widest">Add some high-heat trendiness to your collection.</p>
          <Link href="/browse" className="btn-primary">Start Shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <div className="pt-32 pb-20 container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-12 tracking-tighter uppercase text-zinc-900 dark:text-white">YOUR <span className="text-[#fb5607]">BAG</span></h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            {cart.map((item) => (
              <div key={item.cartItemId} className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] flex flex-col sm:flex-row gap-8 items-center border border-zinc-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all">
                <div className="w-32 h-40 relative rounded-2xl overflow-hidden shrink-0 shadow-lg bg-zinc-100 dark:bg-zinc-800">
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
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 font-black uppercase text-[8px] tracking-widest">
                        No Image
                      </div>
                    )}
                  </Link>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#fb5607]">{item.category}</span>
                    {item.selectedSize && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-white/10 px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-400">
                        Size: {item.selectedSize}
                      </span>
                    )}
                  </div>
                  <Link href={`/product/${item._id}`}>
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-zinc-900 dark:text-white hover:text-[#fb5607] transition-colors">{item.name}</h3>
                  </Link>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-center sm:justify-start gap-4">
                      <button
                        onClick={() => updateQty(item, -1)}
                        disabled={item.qty <= 1}
                        className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 rounded-xl hover:bg-[#fb5607] hover:text-white transition-all border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white disabled:opacity-20"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-black text-xl w-8 text-center text-zinc-900 dark:text-white">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item, 1)}
                        disabled={item.qty >= (stockStatus[item._id]?.stock ?? 0)}
                        className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-white/5 rounded-xl hover:bg-[#fb5607] hover:text-white transition-all border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white disabled:opacity-20"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {stockStatus[item._id]?.message && (
                      <div className="flex items-center gap-2 text-[#fb5607] font-black text-[10px] uppercase tracking-widest">
                        <AlertCircle size={14} />
                        {stockStatus[item._id].message}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center sm:text-right flex flex-col justify-between h-full">
                  <p className="text-3xl font-black tracking-tighter mb-6 text-zinc-900 dark:text-white">₹{item.price * item.qty}</p>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
                  >
                    <Trash2 size={16} /> REMOVE
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-black text-white p-12 rounded-[48px] sticky top-32 shadow-2xl">
              <h2 className="text-3xl font-black mb-10 uppercase tracking-tighter">Summary</h2>
              <div className="space-y-6 mb-10">
                <div className="flex justify-between text-zinc-400 font-bold uppercase text-xs tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-zinc-400 font-bold uppercase text-xs tracking-widest">
                  <span>Shipping</span>
                  <span className="text-[#fb5607]">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <hr className="border-white/10" />
                <div className="flex justify-between items-end">
                  <span className="text-zinc-500 font-black uppercase text-sm tracking-tighter">Total Amount</span>
                  <span className="text-4xl font-black tracking-tighter text-[#fb5607]">₹{total}</span>
                </div>
              </div>
              <button
                onClick={() => router.push('/checkout')}
                disabled={isCartInvalid || validating || cart.length === 0}
                className="w-full py-5 rounded-3xl bg-[#fb5607] text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                {validating ? 'CHECKING VIBES...' : isCartInvalid ? 'STOCK ERROR' : 'Safe Checkout'}
              </button>
              <div className="flex items-center justify-center gap-4 mt-8 opacity-20 invert grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
