'use client';
import { Package, Users as UsersIcon, ShoppingCart, DollarSign } from 'lucide-react';

export default function OverviewTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Revenue', val: `₹${data.orders.reduce((t, o) => t + (o.isPaid ? o.totalPrice : 0), 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Active Orders', val: data.orders.length, icon: ShoppingCart, color: 'text-[#fb5607]', bg: 'bg-[#fb5607]/10' },
          { label: 'Total Users', val: data.users.length, icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Products', val: data.products.length, icon: Package, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.bg} w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mb-0.5">{stat.label}</p>
            <h3 className="text-xl sm:text-2xl font-bold leading-none text-zinc-900 dark:text-white">{stat.val}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}