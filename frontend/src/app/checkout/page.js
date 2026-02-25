'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/layout/Navbar';
import { useRouter } from 'next/navigation';
import API from '@/utils/api';
import { MapPin, CreditCard, ChevronRight, Package, Truck, ShieldCheck, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
    const { cart, user, clearCart, _hasHydrated } = useStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: 'India',
        phone: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (_hasHydrated) {
            if (!user) {
                router.push('/login?redirect=/checkout');
            } else if (cart.length === 0) {
                router.push('/cart');
            }
        }
    }, [user, cart, router, _hasHydrated]);

    const subtotal = cart.reduce((total, item) => total + item.price * item.qty, 0);
    const shipping = subtotal > 1500 ? 0 : 99;
    const total = subtotal + shipping;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Final Stock Validation
            for (const item of cart) {
                const { data: product } = await API.get(`/products/${item._id}`);
                if (!product) {
                    throw new Error(`Product ${item.name} is no longer available.`);
                }
                if (product.stock < item.qty) {
                    throw new Error(`Limited stock for ${item.name}. Available: ${product.stock}. Please update your cart.`);
                }
            }

            const orderData = {
                orderItems: cart.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: item.image,
                    price: item.price,
                    product: item._id
                })),
                shippingAddress: {
                    address: formData.address,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    country: formData.country
                },
                paymentMethod: 'COD',
                totalPrice: total
            };

            const { data } = await API.post('/orders', orderData);
            clearCart();
            router.push(`/order/success/${data._id}`);
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to place order';
            setError(msg);
            if (msg.toLowerCase().includes('stock') || msg.toLowerCase().includes('available')) {
                setTimeout(() => router.push('/cart'), 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!_hasHydrated) return null;
    if (!user || cart.length === 0) return null;

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar />
            <div className="pt-32 pb-20 container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">

                    {/* Left: Form */}
                    <div className="flex-1 space-y-8">
                        <header className="mb-10">
                            <div className="flex items-center gap-2 text-[#fb5607] font-black uppercase text-[10px] tracking-[0.3em] mb-2">
                                <Truck size={14} /> Shipping & Payment
                            </div>
                            <h1 className="text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">CHECKOUT</h1>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Shipping section */}
                            <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[48px] shadow-sm border border-zinc-100 dark:border-white/5">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-zinc-100 dark:bg-white/5 rounded-2xl">
                                        <MapPin className="text-[#fb5607]" size={24} />
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Shipping Details</h2>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Street Address</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. 123, Street Name"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-white/5 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">City</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Mumbai"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full bg-zinc-50 dark:bg-white/5 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Postal Code</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. 400001"
                                                value={formData.postalCode}
                                                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                                className="w-full bg-zinc-50 dark:bg-white/5 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Country</label>
                                        <input
                                            type="text"
                                            required
                                            readOnly
                                            value={formData.country}
                                            className="w-full bg-zinc-100 dark:bg-white/5 border-none rounded-2xl px-6 py-4 font-bold outline-none text-zinc-400 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[48px] shadow-sm border border-zinc-100 dark:border-white/5">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-zinc-100 dark:bg-white/5 rounded-2xl">
                                        <CreditCard className="text-[#fb5607]" size={24} />
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Payment Method</h2>
                                </div>

                                <div className="p-6 rounded-3xl border-2 border-[#fb5607] bg-[#fb5607]/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded-full bg-[#fb5607] flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase tracking-tight">Cash on Delivery (COD)</p>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pay when you receive the gear</p>
                                        </div>
                                    </div>
                                    <ShieldCheck className="text-[#fb5607]" size={24} />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-xs uppercase tracking-widest animate-shake">
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-6 rounded-3xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-[#fb5607] hover:text-white transition-all transform active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'DEPLOYING ORDER...' : 'PLACE ORDER'}
                            </button>
                        </form>
                    </div>

                    {/* Right: Summary Sidebar */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[48px] sticky top-32 shadow-xl border border-zinc-100 dark:border-white/5">
                            <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter">Order Summary</h2>

                            <div className="space-y-6 mb-8 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                                {cart.map((item) => (
                                    <div key={item._id} className="flex gap-4 items-center">
                                        <div className="w-16 h-20 bg-zinc-100 dark:bg-white/5 rounded-xl overflow-hidden shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-black uppercase tracking-tight truncate">{item.name}</h4>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">QTY: {item.qty} × ₹{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-white/5">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    <span>Shipping</span>
                                    <span className="text-[#fb5607]">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                </div>
                                <div className="flex justify-between items-end pt-4">
                                    <span className="text-xs font-black uppercase tracking-tighter">Total</span>
                                    <span className="text-3xl font-black tracking-tighter text-[#fb5607]">₹{total}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
