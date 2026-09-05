'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Check, Truck, Package } from 'lucide-react';

export default function OrderModal({ show, onClose, currentOrder, updateOrderStatus }) {
  const [showShipForm, setShowShipForm] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [courierName, setCourierName] = useState('Delhivery');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [shipLoading, setShipLoading] = useState(false);

  const handleShipSubmit = async () => {
    if (!trackingId.trim()) return;
    setShipLoading(true);
    await updateOrderStatus(currentOrder._id, 'ship', { trackingId: trackingId.trim(), courierName, estimatedDelivery: estimatedDelivery.trim() });
    setShipLoading(false);
    setShowShipForm(false);
    setTrackingId('');
    setCourierName('Delhivery');
    setEstimatedDelivery('');
  };

  const handleClose = () => {
    setShowShipForm(false);
    setTrackingId('');
    setCourierName('Delhivery');
    setEstimatedDelivery('');
    onClose();
  };

  return (
    <AnimatePresence>
      {show && currentOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="absolute inset-0 bg-zinc-950 dark:bg-zinc-900/40 backdrop-blur-md" />
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="relative bg-white dark:bg-zinc-950 dark:text-zinc-100 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <p className="text-[11px] text-zinc-400 font-medium mt-1">#{currentOrder._id}</p>
                </div>
                <button onClick={handleClose} className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-all"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Left: Info */}
                <div className="md:col-span-2 space-y-12">
                  <section>
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#fb5607] mb-6">Customer & Shipping</h3>
                    <div className="grid grid-cols-2 gap-8 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-800 p-8 rounded-[32px]">
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Customer</p>
                        <p className="font-black uppercase">{currentOrder.user?.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{currentOrder.user?.email}</p>
                        {currentOrder.shippingAddress.phone && (
                          <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mt-1">📞 {currentOrder.shippingAddress.phone}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Shipping Address</p>
                        <p className="text-xs font-bold leading-relaxed">
                          {currentOrder.shippingAddress.address}<br />
                          {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.postalCode}<br />
                          {currentOrder.shippingAddress.country}
                        </p>
                      </div>
                    </div>
                  </section>

                  {currentOrder.trackingId && (
                    <section>
                      <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-6">Tracking Information</h3>
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-8 rounded-[32px]">
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Tracking ID</p>
                            <p className="font-black uppercase text-blue-700">{currentOrder.trackingId}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Courier</p>
                            <p className="font-black uppercase">{currentOrder.courierName || 'N/A'}</p>
                          </div>
                          {currentOrder.shippedAt && (
                            <div>
                              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Shipped On</p>
                              <p className="font-bold text-sm">{new Date(currentOrder.shippedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                          )}
                          {currentOrder.estimatedDelivery && (
                            <div>
                              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Est. Delivery</p>
                              <p className="font-bold text-sm">{currentOrder.estimatedDelivery}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  )}

                  <section>
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#fb5607] mb-6">Order Items</h3>
                    <div className="space-y-4">
                      {currentOrder.orderItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-6 p-4 border border-zinc-100 dark:border-zinc-700 rounded-[24px]">
                          <img src={item.image} className="w-16 h-20 object-cover rounded-xl" alt={item.name} />
                          <div className="flex-1">
                            <p className="font-black uppercase text-sm">{item.name}</p>
                            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                              {item.size ? `SIZE: ${item.size} | ` : ''}₹{item.price} × {item.qty}
                            </p>
                          </div>
                          <p className="font-black text-lg">₹{item.price * item.qty}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Right: Summary & Action */}
                <div className="space-y-8">
                  <section className="bg-zinc-950 dark:bg-zinc-900 text-white p-10 rounded-[40px]">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8">Summary</h3>
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">
                        <span>Payment Method</span>
                        <span className="text-white">{currentOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">
                        <span>Payment Status</span>
                        <span className={currentOrder.isPaid ? 'text-emerald-500' : 'text-orange-500'}>{currentOrder.isPaid ? 'PAID' : 'PENDING'}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">
                        <span>Order Status</span>
                        <span className={`font-black ${currentOrder.status === 'Cancelled' ? 'text-red-500' : currentOrder.status === 'Delivered' ? 'text-emerald-500' : 'text-orange-500'}`}>
                          {currentOrder.status?.toUpperCase() || 'PROCESSING'}
                        </span>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400">Total Price</span>
                        <span className="text-4xl font-black tracking-tighter text-[#fb5607]">₹{currentOrder.totalPrice}</span>
                      </div>
                    </div>
                  </section>

                  {showShipForm && currentOrder.status === 'Processing' && (
                    <section className="mt-8">
                      <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-6">Shipping Details</h3>
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-8 rounded-[32px] space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Tracking ID *</label>
                          <input type="text" value={trackingId} onChange={(e) => setTrackingId(e.target.value)}
                            placeholder="e.g. AWB123456789" className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Courier</label>
                          <select value={courierName} onChange={(e) => setCourierName(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-blue-500">
                            {['Delhivery', 'Shiprocket', 'BlueDart', 'India Post', 'DTDC', 'Ecom Express', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Estimated Delivery</label>
                          <input type="text" value={estimatedDelivery} onChange={(e) => setEstimatedDelivery(e.target.value)}
                            placeholder="e.g. 3-5 business days" className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button onClick={handleShipSubmit} disabled={!trackingId.trim() || shipLoading}
                            className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50">
                            {shipLoading ? 'Processing...' : 'Confirm & Ship'}
                          </button>
                          <button onClick={() => setShowShipForm(false)}
                            className="px-6 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 font-black text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all">Cancel</button>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Dynamic Action Buttons */}
                  {!showShipForm && (
                    <div className="flex flex-col gap-4">
                      {currentOrder.status === 'Processing' && (
                        <>
                          <button
                            onClick={() => setShowShipForm(true)}
                            className="w-full py-6 rounded-3xl bg-blue-600 text-white font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all"
                          >
                            Mark as Shipped
                          </button>
                          <button
                            onClick={() => updateOrderStatus(currentOrder._id, 'cancel')}
                            className="w-full py-6 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-200 dark:border-zinc-600 font-black text-sm uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                          >
                            Cancel Order & Restore Stock
                          </button>
                        </>
                      )}

                      {currentOrder.status === 'Shipped' && (
                        <button
                          onClick={() => updateOrderStatus(currentOrder._id, 'deliver')}
                          className="w-full py-6 rounded-3xl bg-emerald-600 text-white font-black text-sm uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all"
                        >
                          Mark as Delivered
                        </button>
                      )}

                      {currentOrder.status === 'Cancelled' && (
                        <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex items-center justify-center gap-3 text-red-600 font-black uppercase text-xs">
                          <ShieldAlert size={18} /> Order Cancelled
                        </div>
                      )}

                      {currentOrder.status === 'Delivered' && (
                        <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex items-center justify-center gap-3 text-emerald-600 font-black uppercase text-xs">
                          <Check size={18} /> Order Delivered
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}