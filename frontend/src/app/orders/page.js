'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import API from '@/utils/api';
import { Package, ChevronRight, Clock, CheckCircle2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import BrandLoader from '@/components/ui/BrandLoader';

export default function MyOrdersPage() {
    const { user, _hasHydrated } = useStore();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (_hasHydrated && !user) {
            router.push('/login?redirect=/orders');
            return;
        }

        if (!_hasHydrated || !user) return;

        const fetchOrders = async () => {
            try {
                const { data } = await API.get('/orders/myorders');
                setOrders(data);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, router]);

    if (loading) return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar />
            <div className="pt-32 flex items-center justify-center"><BrandLoader size="lg" /></div>
        </main>
    );

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar />
            <div className="w-full max-w-[1920px] mx-auto pt-24 pb-20" style={{ paddingLeft: 'clamp(16px, 4vw, 64px)', paddingRight: 'clamp(16px, 4vw, 64px)' }}>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">My Orders</h1>
                        <p className="text-sm text-zinc-400 mt-1">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900 p-12 sm:p-16 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800">
                            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <ShoppingBag size={28} className="text-zinc-300" />
                            </div>
                            <h2 className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">No orders yet</h2>
                            <p className="text-zinc-400 text-sm mb-6">Start shopping to see your orders here.</p>
                            <Link href="/browse" className="inline-block bg-[#fb5607] text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-[#e04e06] transition-all">
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <Link key={order._id} href={`/order/success/${order._id}`}
                                    className="block bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800 hover:shadow-md hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-xl overflow-hidden shrink-0">
                                            <img src={order.orderItems[0]?.image} className="w-full h-full object-cover" alt="Product" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-semibold text-zinc-400">#{order._id.slice(-8).toUpperCase()}</span>
                                                <span className="text-[10px] text-zinc-300">•</span>
                                                <span className="text-[10px] text-zinc-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white truncate mb-1.5 capitalize">
                                                {order.orderItems.length > 1 ? `${order.orderItems[0].name} + ${order.orderItems.length - 1} more` : order.orderItems[0].name}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                {order.isDelivered ? (
                                                    <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-semibold">
                                                        <CheckCircle2 size={12} /> Delivered
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-[#fb5607] text-[10px] font-semibold">
                                                        <Clock size={12} /> Processing
                                                    </div>
                                                )}
                                                <span className="text-sm font-bold text-zinc-900 dark:text-white">₹{order.totalPrice}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-600 group-hover:text-[#fb5607] transition-colors shrink-0" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
