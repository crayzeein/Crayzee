'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import API from '@/utils/api';
import { Package, ChevronRight, Clock, CheckCircle2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

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

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-2xl animate-pulse text-purple-600">LOCATING DROPS...</div>;

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar />
            <div className="pt-32 pb-20 container mx-auto px-4 max-w-5xl">
                <header className="mb-12">
                    <div className="flex items-center gap-2 text-[#fb5607] font-black uppercase text-[10px] tracking-[0.3em] mb-2">
                        <Package size={14} /> Mission Logs
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">MY <span className="text-[#fb5607]">ORDERS</span></h1>
                </header>

                {orders.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 p-8 sm:p-12 md:p-20 rounded-[32px] md:rounded-[48px] text-center border border-zinc-100 dark:border-white/5">
                        <div className="w-24 h-24 bg-zinc-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-zinc-200">
                            <ShoppingBag size={48} />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-4">No Drops Yet</h2>
                        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-10">You haven't secured any gear yet. Start your mission today.</p>
                        <Link href="/browse" className="btn-primary inline-block">Explore Drops</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 shadow-sm border border-zinc-100 dark:border-white/5 group hover:shadow-xl transition-all">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-24 bg-zinc-50 dark:bg-white/5 rounded-2xl overflow-hidden shrink-0">
                                            <img src={order.orderItems[0]?.image} className="w-full h-full object-cover" alt="Product" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#fb5607]">#{order._id.slice(-8)}</span>
                                                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                                                {order.orderItems.length > 1 ? `${order.orderItems[0].name} + ${order.orderItems.length - 1} more` : order.orderItems[0].name}
                                            </h3>
                                            {order.orderItems[0]?.size && (
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Size: {order.orderItems[0].size}</p>
                                            )}
                                            <div className="flex items-center gap-4">
                                                {order.isDelivered ? (
                                                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase">
                                                        <CheckCircle2 size={14} /> Delivered
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase">
                                                        <Clock size={14} /> Processing
                                                    </div>
                                                )}
                                                <span className="text-xl font-black tracking-tighter">₹{order.totalPrice}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/order/success/${order._id}`}
                                        className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-zinc-100 dark:bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group-hover:bg-[#fb5607] group-hover:text-white"
                                    >
                                        View Details <ChevronRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
