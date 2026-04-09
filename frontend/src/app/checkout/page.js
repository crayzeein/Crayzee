'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Navbar from '@/components/layout/Navbar';
import { useRouter } from 'next/navigation';
import API from '@/utils/api';
import { MapPin, CreditCard, ChevronRight, Package, Truck, ShieldCheck, AlertCircle, Smartphone, Banknote } from 'lucide-react';

export default function CheckoutPage() {
    const { cart, user, clearCart, _hasHydrated } = useStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('ONLINE');
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

    const validateForm = () => {
        if (!formData.address || !formData.city || !formData.postalCode) {
            setError('Please fill all shipping details.');
            return false;
        }
        return true;
    };

    const validateStock = async () => {
        for (const item of cart) {
            const { data: product } = await API.get(`/products/${item._id}`);
            if (!product) {
                throw new Error(`Product ${item.name} is no longer available.`);
            }
            if (product.stock < item.qty) {
                throw new Error(`Limited stock for ${item.name}. Available: ${product.stock}. Please update your cart.`);
            }
        }
    };

    const placeOrder = async (payMethod, paymentResult = {}) => {
        const orderData = {
            orderItems: cart.map(item => ({
                name: item.name,
                qty: item.qty,
                image: item.images?.[0]?.url || item.image,
                price: item.price,
                size: item.selectedSize,
                product: item._id
            })),
            shippingAddress: {
                address: formData.address,
                city: formData.city,
                postalCode: formData.postalCode,
                country: formData.country
            },
            paymentMethod: payMethod,
            totalPrice: total,
            isPaid: payMethod === 'Razorpay',
            paidAt: payMethod === 'Razorpay' ? new Date() : undefined,
            paymentResult: paymentResult
        };

        const { data } = await API.post('/orders', orderData);
        clearCart();
        router.push(`/order/success/${data._id}`);
    };

    // COD Order
    const handleCODOrder = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        setError('');

        try {
            await validateStock();
            await placeOrder('COD');
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

    // Online Payment via Razorpay
    const handleOnlinePayment = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        setError('');

        try {
            await validateStock();

            // 1. Create Razorpay order on backend
            const { data: razorpayOrder } = await API.post('/payment/create-order', {
                amount: total
            });

            // 2. Open Razorpay checkout popup
            const options = {
                key: razorpayOrder.key,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: 'CRAYZEE.IN',
                description: `Order for ${cart.length} item(s)`,
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    try {
                        // 3. Verify payment on backend
                        const { data: verification } = await API.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verification.verified) {
                            // 4. Place order with payment details
                            await placeOrder('Razorpay', {
                                id: response.razorpay_payment_id,
                                status: 'completed',
                                update_time: new Date().toISOString(),
                                email_address: user.email
                            });
                        } else {
                            setError('Payment verification failed. Please contact support.');
                        }
                    } catch (verifyError) {
                        setError('Payment verification failed. If amount was deducted, please contact support.');
                    }
                    setLoading(false);
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: formData.phone || ''
                },
                theme: {
                    color: '#fb5607'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        setError('Payment was cancelled.');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setLoading(false);
                setError(`Payment failed: ${response.error.description}`);
            });
            rzp.open();

        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Payment failed';
            setError(msg);
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        if (paymentMethod === 'ONLINE') {
            handleOnlinePayment(e);
        } else {
            handleCODOrder(e);
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
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="e.g. 9876543210"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-zinc-50 dark:bg-white/5 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#fb5607] transition-all"
                                        />
                                    </div>
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

                                <div className="space-y-4">
                                    {/* Online Payment Option */}
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('ONLINE')}
                                        className={`w-full p-6 rounded-3xl flex items-center justify-between transition-all duration-300 border-2 ${
                                            paymentMethod === 'ONLINE'
                                                ? 'border-[#fb5607] bg-[#fb5607]/5 shadow-lg shadow-[#fb5607]/10'
                                                : 'border-zinc-100 dark:border-white/10 bg-white dark:bg-zinc-800 hover:border-zinc-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                                paymentMethod === 'ONLINE' ? 'bg-[#fb5607]' : 'bg-zinc-200 dark:bg-zinc-600'
                                            }`}>
                                                {paymentMethod === 'ONLINE' && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-sm uppercase tracking-tight">Pay Online</p>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">UPI · Cards · Net Banking · Wallets</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="text-[#fb5607]" size={20} />
                                            <ShieldCheck className={paymentMethod === 'ONLINE' ? 'text-[#fb5607]' : 'text-zinc-300'} size={20} />
                                        </div>
                                    </button>

                                    {/* COD Option */}
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('COD')}
                                        className={`w-full p-6 rounded-3xl flex items-center justify-between transition-all duration-300 border-2 ${
                                            paymentMethod === 'COD'
                                                ? 'border-[#fb5607] bg-[#fb5607]/5 shadow-lg shadow-[#fb5607]/10'
                                                : 'border-zinc-100 dark:border-white/10 bg-white dark:bg-zinc-800 hover:border-zinc-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                                paymentMethod === 'COD' ? 'bg-[#fb5607]' : 'bg-zinc-200 dark:bg-zinc-600'
                                            }`}>
                                                {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-sm uppercase tracking-tight">Cash on Delivery</p>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pay when you receive the gear</p>
                                            </div>
                                        </div>
                                        <Banknote className={paymentMethod === 'COD' ? 'text-[#fb5607]' : 'text-zinc-300'} size={24} />
                                    </button>
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
                                {loading
                                    ? 'PROCESSING...'
                                    : paymentMethod === 'ONLINE'
                                        ? `PAY ₹${total} NOW`
                                        : 'PLACE COD ORDER'
                                }
                            </button>
                        </form>
                    </div>

                    {/* Right: Summary Sidebar */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[48px] sticky top-32 shadow-xl border border-zinc-100 dark:border-white/5">
                            <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter">Order Summary</h2>

                            <div className="space-y-6 mb-8 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                                {cart.map((item) => (
                                    <div key={item.cartItemId} className="flex gap-4 items-center">
                                        <div className="w-16 h-20 bg-zinc-100 dark:bg-white/5 rounded-xl overflow-hidden shrink-0">
                                            <img src={item.images?.[0]?.url || item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-black uppercase tracking-tight truncate">{item.name}</h4>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                                {item.selectedSize ? `SIZE: ${item.selectedSize} | ` : ''}QTY: {item.qty} × ₹{item.price}
                                            </p>
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
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    <span>Payment</span>
                                    <span className="text-emerald-500">{paymentMethod === 'ONLINE' ? 'ONLINE (UPI/CARD)' : 'COD'}</span>
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
