'use client';
import { Check } from 'lucide-react';

export default function OrdersTab({ orderTab, setOrderTab, getFilteredOrders, handleViewOrder, updateOrderStatus }) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Order Filter Tabs - scrollable on mobile */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-zinc-100 dark:bg-zinc-800 p-1.5 sm:p-2 rounded-2xl sm:rounded-[32px] overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All' },
          { id: 'processing', label: 'Processing' },
          { id: 'shipped', label: 'Shipped' },
          { id: 'delivered', label: 'Delivered' },
          { id: 'cancelled', label: 'Cancelled' },
          { id: 'history', label: 'History' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setOrderTab(tab.id)}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-3xl font-bold text-[9px] sm:text-[10px] uppercase tracking-wider whitespace-nowrap transition-all shrink-0 ${orderTab === tab.id ? 'bg-black dark:bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-3">
        {getFilteredOrders().map((o) => (
          <div key={o._id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-mono text-[#fb5607] font-black text-xs">#{o._id.slice(-8).toUpperCase()}</p>
                <p className="text-[8px] text-zinc-400 font-medium">{new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                {o.status === 'Cancelled' && <span className="px-2 py-1 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-lg font-bold text-[8px] uppercase">Cancelled</span>}
                {o.status === 'Processing' && <span className="px-2 py-1 bg-orange-50 dark:bg-orange-950/30 text-orange-500 rounded-lg font-bold text-[8px] uppercase">Processing</span>}
                {o.status === 'Shipped' && <span className="px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-lg font-bold text-[8px] uppercase">In Transit</span>}
                {o.status === 'Delivered' && <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-lg font-bold text-[8px] uppercase flex items-center gap-1"><Check size={10} /> Delivered</span>}
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-sm">{o.user?.name || 'User'}</p>
                <p className="text-[8px] text-zinc-400 uppercase">{o.paymentMethod}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-lg">₹{o.totalPrice}</p>
                <p className={`text-[7px] font-bold uppercase ${o.isPaid ? 'text-emerald-500' : 'text-zinc-400'}`}>{o.isPaid ? 'Paid ✓' : 'Pending'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleViewOrder(o)} className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[9px] font-bold uppercase text-center hover:bg-black hover:text-white transition-all">View</button>
              {o.status === 'Processing' && (
                <>
                  <button onClick={() => updateOrderStatus(o._id, 'ship')} className="py-2 px-3 bg-blue-600 text-white rounded-lg text-[9px] font-bold uppercase">Ship</button>
                  <button onClick={() => updateOrderStatus(o._id, 'cancel')} className="py-2 px-3 bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-900 text-red-500 rounded-lg text-[9px] font-bold uppercase">Cancel</button>
                </>
              )}
              {o.status === 'Shipped' && (
                <button onClick={() => updateOrderStatus(o._id, 'deliver')} className="py-2 px-3 bg-emerald-600 text-white rounded-lg text-[9px] font-bold uppercase">Deliver</button>
              )}
            </div>
          </div>
        ))}
        {getFilteredOrders().length === 0 && (
          <div className="py-12 text-center text-zinc-400 font-bold text-sm">No orders found 🏜️</div>
        )}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Order Details</th>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Customer</th>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Pricing</th>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                <th className="px-6 py-4 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 text-center">Lifecycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {getFilteredOrders().map((o) => (
                <tr key={o._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-mono text-[#fb5607] font-black text-xs leading-tight mb-0.5">#{o._id.slice(-8).toUpperCase()}</p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm uppercase leading-tight">{o.user?.name || 'Crayzee User'}</p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{o.paymentMethod}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-base leading-tight">₹{o.totalPrice}</p>
                    <p className={`text-[8px] font-bold uppercase ${o.isPaid ? 'text-emerald-500' : 'text-zinc-300'}`}>{o.isPaid ? 'Paid' : 'Pending'}</p>
                  </td>
                  <td className="px-6 py-4">
                    {o.status === 'Cancelled' && <span className="px-3 py-1 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full font-bold text-[9px] uppercase">Cancelled</span>}
                    {o.status === 'Processing' && <span className="px-3 py-1 bg-orange-50 dark:bg-orange-950/30 text-orange-500 rounded-full font-bold text-[9px] uppercase">Processing</span>}
                    {o.status === 'Shipped' && <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-full font-bold text-[9px] uppercase">In Transit</span>}
                    {o.status === 'Delivered' && <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full font-bold text-[9px] uppercase flex items-center gap-1 w-fit"><Check size={10} /> Delivered</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleViewOrder(o)} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[9px] font-bold uppercase hover:bg-black hover:text-white transition-all">View</button>
                      {o.status === 'Processing' && (
                        <>
                          <button onClick={() => updateOrderStatus(o._id, 'ship')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-blue-700 transition-all">Ship</button>
                          <button onClick={() => updateOrderStatus(o._id, 'cancel')} className="px-4 py-2 bg-white dark:bg-zinc-800 border border-red-200 text-red-500 rounded-lg text-[9px] font-bold uppercase hover:bg-red-50 transition-all">Cancel</button>
                        </>
                      )}
                      {o.status === 'Shipped' && (
                        <button onClick={() => updateOrderStatus(o._id, 'deliver')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-emerald-700 transition-all">Deliver</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {getFilteredOrders().length === 0 && (
                <tr><td colSpan="5" className="py-16 text-center text-zinc-400 font-bold uppercase tracking-widest text-sm">No orders found 🏜️</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}