'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import API from '@/utils/api';
import { CheckCircle2, Package, MapPin, Truck, ChevronRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage({ params }) {
    const { id } = use(params);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await API.get(`/orders/${id}`);
                setOrder(data);
            } catch (error) {
                console.error('Failed to fetch order:', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOrder();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse">VERIFYING DEPLOYMENT...</div>;

    if (!order) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <h2 className="text-3xl font-black mb-4 uppercase">Order Not Found</h2>
            <Link href="/browse" className="btn-primary">Back to Shop</Link>
        </div>
    );

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar />
            <div className="pt-40 pb-20 container mx-auto px-4 max-w-4xl">

                <div className="text-center mb-16">
                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-600 animate-bounce">
                        <CheckCircle2 size={48} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-zinc-900 dark:text-white">COMMAND SUCCESSFUL</h1>
                    <p className="text-zinc-500 font-bold uppercase text-xs tracking-[0.2em]">Your order #{order._id.slice(-8)} has been deployed successfully.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Order Info */}
                    <div className="bg-white dark:bg-zinc-900 p-8 md:p-10 rounded-[40px] shadow-sm border border-zinc-100 dark:border-white/5 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-zinc-50 dark:bg-white/5 rounded-2xl text-[#fb5607]"><Package size={24} /></div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Order Details</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                                <span>Payment</span>
                                <span className="text-zinc-900 dark:text-white">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-400">
                                <span>Status</span>
                                <span className="text-orange-500">{order.isPaid ? 'PAID' : 'PAY ON DELIVERY'}</span>
                            </div>
                            <div className="flex justify-between items-end pt-4 border-t border-zinc-50 dark:border-white/5">
                                <span className="text-sm font-black uppercase tracking-tighter text-zinc-400">Total Amount</span>
                                <span className="text-3xl font-black tracking-tighter text-[#fb5607]">₹{order.totalPrice}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-white dark:bg-zinc-900 p-8 md:p-10 rounded-[40px] shadow-sm border border-zinc-100 dark:border-white/5 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-zinc-50 dark:bg-white/5 rounded-2xl text-[#fb5607]"><MapPin size={24} /></div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Deployment Base</h3>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">{order.shippingAddress.address}</p>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{order.shippingAddress.country}</p>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl text-emerald-600">
                            <Truck size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Estimated Arrival: 3-5 Working Days</span>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/browse" className="btn-primary flex items-center justify-center gap-3">
                        Continue Mission <ShoppingBag size={18} />
                    </Link>
                    <Link href="/profile" className="px-10 py-5 rounded-3xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 font-black text-xs uppercase tracking-widest text-center hover:bg-zinc-50 dark:hover:bg-white/10 transition-all">
                        Order History
                    </Link>
                </div>

            </div>
        </main>
    );
}
