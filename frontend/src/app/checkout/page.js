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
            <div className="w-full max-w-[1920px] mx-auto pt-24 pb-20" style={{ paddingLeft: 'clamp(16px, 4vw, 64px)', paddingRight: 'clamp(16px, 4vw, 64px)' }}>
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Checkout</h1>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* Left: Form */}
                        <div className="flex-1 space-y-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Shipping */}
                                <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2.5 mb-5">
                                        <MapPin size={18} className="text-[#fb5607]" />
                                        <h2 className="text-base font-bold text-zinc-900 dark:text-white">Shipping Details</h2>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Phone Number</label>
                                            <input type="tel" required placeholder="e.g. 9876543210" value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-[#fb5607] focus:ring-1 focus:ring-[#fb5607] transition-all text-zinc-900 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Street Address</label>
                                            <input type="text" required placeholder="e.g. 123, Street Name" value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-[#fb5607] focus:ring-1 focus:ring-[#fb5607] transition-all text-zinc-900 dark:text-white" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">City</label>
                                                <input type="text" required placeholder="e.g. Mumbai" value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-[#fb5607] focus:ring-1 focus:ring-[#fb5607] transition-all text-zinc-900 dark:text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Postal Code</label>
                                                <input type="text" required placeholder="e.g. 400001" value={formData.postalCode}
                                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-[#fb5607] focus:ring-1 focus:ring-[#fb5607] transition-all text-zinc-900 dark:text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Country</label>
                                            <input type="text" required readOnly value={formData.country}
                                                className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-400 cursor-not-allowed" />
                                        </div>
                                    </div>
                                </div>

                                {/* Payment */}
                                <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2.5 mb-5">
                                        <CreditCard size={18} className="text-[#fb5607]" />
                                        <h2 className="text-base font-bold text-zinc-900 dark:text-white">Payment Method</h2>
                                    </div>

                                    <div className="space-y-3">
                                        <button type="button" onClick={() => setPaymentMethod('ONLINE')}
                                            className={`w-full p-4 rounded-xl flex items-center justify-between transition-all border ${
                                                paymentMethod === 'ONLINE'
                                                    ? 'border-[#fb5607] bg-[#fb5607]/5'
                                                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-300'
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                                    paymentMethod === 'ONLINE' ? 'bg-[#fb5607]' : 'bg-zinc-200 dark:bg-zinc-600'
                                                }`}>
                                                    {paymentMethod === 'ONLINE' && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-semibold text-sm text-zinc-900 dark:text-white">Pay Online</p>
                                                    <p className="text-[10px] text-zinc-400">UPI · Cards · Net Banking</p>
                                                </div>
                                            </div>
                                            <Smartphone className={paymentMethod === 'ONLINE' ? 'text-[#fb5607]' : 'text-zinc-300'} size={18} />
                                        </button>

                                        <button type="button" onClick={() => setPaymentMethod('COD')}
                                            className={`w-full p-4 rounded-xl flex items-center justify-between transition-all border ${
                                                paymentMethod === 'COD'
                                                    ? 'border-[#fb5607] bg-[#fb5607]/5'
                                                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-300'
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                                    paymentMethod === 'COD' ? 'bg-[#fb5607]' : 'bg-zinc-200 dark:bg-zinc-600'
                                                }`}>
                                                    {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-semibold text-sm text-zinc-900 dark:text-white">Cash on Delivery</p>
                                                    <p className="text-[10px] text-zinc-400">Pay when you receive</p>
                                                </div>
                                            </div>
                                            <Banknote className={paymentMethod === 'COD' ? 'text-[#fb5607]' : 'text-zinc-300'} size={18} />
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-sm font-medium">
                                        <AlertCircle size={16} /> {error}
                                    </div>
                                )}

                                <button type="submit" disabled={loading}
                                    className="w-full py-3.5 rounded-xl bg-[#fb5607] text-white font-semibold text-sm uppercase tracking-wider hover:bg-[#e04e06] active:scale-[0.98] transition-all disabled:opacity-50">
                                    {loading
                                        ? 'Processing...'
                                        : paymentMethod === 'ONLINE'
                                            ? `Pay ₹${total}`
                                            : 'Place COD Order'
                                    }
                                </button>
                            </form>
                        </div>

                        {/* Right: Summary */}
                        <div className="w-full lg:w-[340px]">
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl sticky top-24 border border-zinc-100 dark:border-zinc-800">
                                <h2 className="text-base font-bold mb-5 text-zinc-900 dark:text-white">Order Summary</h2>

                                <div className="space-y-4 mb-5 max-h-52 overflow-y-auto pr-1 no-scrollbar">
                                    {cart.map((item) => (
                                        <div key={item.cartItemId} className="flex gap-3 items-center">
                                            <div className="w-12 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                                                <img src={item.images?.[0]?.url || item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-semibold truncate text-zinc-900 dark:text-white capitalize">{item.name}</h4>
                                                <p className="text-[10px] text-zinc-400 mt-0.5">
                                                    {item.selectedSize ? `Size: ${item.selectedSize} · ` : ''}Qty: {item.qty} × ₹{item.price}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Subtotal</span>
                                        <span className="font-semibold text-zinc-900 dark:text-white">₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Shipping</span>
                                        <span className={`font-semibold ${shipping === 0 ? 'text-green-500' : ''}`}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Payment</span>
                                        <span className="font-semibold text-zinc-900 dark:text-white">{paymentMethod === 'ONLINE' ? 'Online' : 'COD'}</span>
                                    </div>
                                    <hr className="border-zinc-100 dark:border-zinc-800" />
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-sm text-zinc-500">Total</span>
                                        <span className="text-xl font-bold text-[#fb5607]">₹{total}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
