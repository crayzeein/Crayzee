'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import API from '@/utils/api';
import { CheckCircle2, Package, MapPin, Truck, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import BrandLoader from '@/components/ui/BrandLoader';

export default function OrderSuccessPage({ params }) {
    const { id } = use(params);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchOrder = async (retries = 3) => {
            for (let i = 0; i < retries; i++) {
                try {
                    const { data } = await API.get(`/orders/${id}`);
                    setOrder(data);
                    return;
                } catch (error) {
                    console.error(`Fetch order attempt ${i + 1} failed:`, error);
                    if (i < retries - 1) {
                        await new Promise(r => setTimeout(r, 1500));
                    }
                }
            }
            setLoading(false);
        };
        if (id) {
            fetchOrder().finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar />
            <div className="pt-32 flex items-center justify-center"><BrandLoader size="lg" /></div>
        </main>
    );

    if (!order) return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar />
            <div className="pt-32 text-center">
                <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">Order not found</h2>
                <Link href="/browse" className="inline-block bg-[#fb5607] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#e04e06] transition-all">
                    Back to Shop
                </Link>
            </div>
        </main>
    );

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar />
            <div className="w-full max-w-[1920px] mx-auto pt-24 pb-20" style={{ paddingLeft: 'clamp(16px, 4vw, 64px)', paddingRight: 'clamp(16px, 4vw, 64px)' }}>
                <div className="max-w-3xl mx-auto">

                    {/* Success Banner */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5 text-emerald-500">
                            <CheckCircle2 size={32} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">Order Placed Successfully!</h1>
                        <p className="text-zinc-400 text-sm">Order #{order._id.slice(-8).toUpperCase()} has been confirmed.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {/* Order Info */}
                        <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2.5 mb-4">
                                <Package size={18} className="text-[#fb5607]" />
                                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Order Details</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Payment</span>
                                    <span className="font-semibold text-zinc-900 dark:text-white">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Status</span>
                                    <span className={`font-semibold ${order.isPaid ? 'text-emerald-500' : 'text-[#fb5607]'}`}>
                                        {order.isPaid ? 'Paid' : 'Pay on Delivery'}
                                    </span>
                                </div>
                                <hr className="border-zinc-100 dark:border-zinc-800" />
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-zinc-400">Total</span>
                                    <span className="text-2xl font-bold text-[#fb5607]">₹{order.totalPrice}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2.5 mb-4">
                                <MapPin size={18} className="text-[#fb5607]" />
                                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Shipping Address</h3>
                            </div>

                            <div className="space-y-1.5 mb-4">
                                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{order.shippingAddress.address}</p>
                                <p className="text-sm text-zinc-400">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                <p className="text-sm text-zinc-400">{order.shippingAddress.country}</p>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <Truck size={15} />
                                <span className="text-xs font-semibold">Estimated: 3-5 working days</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/browse" className="inline-flex items-center justify-center gap-2 bg-[#fb5607] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#e04e06] transition-all">
                            Continue Shopping <ShoppingBag size={16} />
                        </Link>
                        <Link href="/orders" className="inline-flex items-center justify-center border border-zinc-200 dark:border-zinc-700 px-8 py-3 rounded-xl font-semibold text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                            View All Orders
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}
