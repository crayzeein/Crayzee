'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import API from '@/utils/api';
import { Package, ChevronRight, Clock, CheckCircle2, ShoppingBag, Truck, XCircle, CreditCard, Banknote } from 'lucide-react';
import Link from 'next/link';
import BrandLoader from '@/components/ui/BrandLoader';

export default function MyOrdersPage() {
    const { user, _hasHydrated } = useStore();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

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

    const getStatusInfo = (order) => {
        if (order.isDelivered) return { label: 'Delivered', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10', icon: CheckCircle2 };
        if (order.isPaid) return { label: 'Confirmed', color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10', icon: Package };
        return { label: 'Pending', color: 'text-[#fb5607] bg-[#fb5607]/10', icon: Clock };
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => {
        if (filter === 'delivered') return o.isDelivered;
        if (filter === 'processing') return !o.isDelivered;
        return true;
    });

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
                    <div className="mb-6">
                        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">My Orders</h1>
                        <p className="text-[12px] text-zinc-400 mt-1">{orders.length} {orders.length === 1 ? 'order' : 'orders'} placed</p>
                    </div>

                    {/* Filter Tabs */}
                    {orders.length > 0 && (
                        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'all', label: 'All Orders', count: orders.length },
                                { id: 'processing', label: 'In Progress', count: orders.filter(o => !o.isDelivered).length },
                                { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.isDelivered).length },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id)}
                                    className={`px-4 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-all ${
                                        filter === tab.id
                                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                                            : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                                    }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>
                    )}

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
                    ) : filteredOrders.length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900 p-10 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800">
                            <p className="text-zinc-400 text-sm">No orders in this category.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredOrders.map((order) => {
                                const status = getStatusInfo(order);
                                const StatusIcon = status.icon;
                                return (
                                    <Link key={order._id} href={`/order/success/${order._id}`}
                                        className="block bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-zinc-100 dark:border-zinc-800 hover:shadow-md hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group">
                                        <div className="flex items-center gap-4">
                                            {/* Product Images Stack */}
                                            <div className="relative w-16 h-20 shrink-0">
                                                <div className="w-16 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-xl overflow-hidden">
                                                    <img src={order.orderItems[0]?.image} className="w-full h-full object-cover" alt="Product" />
                                                </div>
                                                {order.orderItems.length > 1 && (
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-zinc-900 dark:bg-zinc-700 text-white rounded-lg flex items-center justify-center text-[9px] font-bold">
                                                        +{order.orderItems.length - 1}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="text-[10px] font-semibold text-zinc-400">#{order._id.slice(-8).toUpperCase()}</span>
                                                    <span className="text-[10px] text-zinc-300">•</span>
                                                    <span className="text-[10px] text-zinc-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white truncate mb-2 capitalize">
                                                    {order.orderItems.length > 1 ? `${order.orderItems[0].name} + ${order.orderItems.length - 1} more` : order.orderItems[0].name}
                                                </h3>
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    {/* Status Badge */}
                                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${status.color}`}>
                                                        <StatusIcon size={11} /> {status.label}
                                                    </div>
                                                    {/* Payment */}
                                                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                                                        {order.paymentMethod === 'COD' ? <Banknote size={11} /> : <CreditCard size={11} />}
                                                        {order.paymentMethod === 'COD' ? 'COD' : 'Paid'}
                                                    </div>
                                                    {/* Price */}
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-white ml-auto">₹{order.totalPrice.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-600 group-hover:text-[#fb5607] transition-colors shrink-0 hidden sm:block" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
