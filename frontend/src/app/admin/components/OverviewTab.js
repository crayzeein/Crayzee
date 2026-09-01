'use client';
import { 
  Package, Users as UsersIcon, ShoppingCart, DollarSign, 
  Eye, UserCheck, Activity, Flame, ArrowUpRight, Smartphone, Monitor, Tablet
} from 'lucide-react';

export default function OverviewTab({ data }) {
  const analytics = data.analytics || {
    liveActiveNow: 0,
    today: { pageviews: 0, uniqueVisitors: 0 },
    week: { pageviews: 0, uniqueVisitors: 0 },
    retention: {
      totalVisitors: 0,
      newVisitors: 0,
      returningVisitors: 0,
      highlyRetainedVisitors: 0,
      retentionRate: 0
    },
    dailyTrend: [],
    topPages: [],
    deviceBreakdown: []
  };

  const totalRevenue = data.orders.reduce((t, o) => t + (o.isPaid ? o.totalPrice : 0), 0);
  const retention = analytics.retention || {};

  return (
    <div className="space-y-6">
      {/* ── 1. CORE BUSINESS STATS ── */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Store Performance</h3>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Revenue', val: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
            { label: 'Active Orders', val: data.orders.length, icon: ShoppingCart, color: 'text-[#fb5607]', bg: 'bg-[#fb5607]/10' },
            { label: 'Registered Users', val: data.users.length, icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
            { label: 'Live Products', val: data.products.length, icon: Package, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' }
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

      {/* ── 2. VISITOR TRAFFIC & LIVE STATS ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Visitor Traffic & Engagement</h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/40 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[11px] font-semibold text-green-700 dark:text-green-400">
              {analytics.liveActiveNow} Active Now
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-amber-50 dark:bg-amber-950/30 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Today</span>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mb-0.5">Unique Visitors Today</p>
            <h3 className="text-xl sm:text-2xl font-bold leading-none text-zinc-900 dark:text-white">
              {analytics.today?.uniqueVisitors || 0}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-2 font-medium">
              {analytics.today?.pageviews || 0} total pageviews
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-indigo-50 dark:bg-indigo-950/30 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">7 Days</span>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mb-0.5">Weekly Visitors</p>
            <h3 className="text-xl sm:text-2xl font-bold leading-none text-zinc-900 dark:text-white">
              {analytics.week?.uniqueVisitors || 0}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-2 font-medium">
              {analytics.week?.pageviews || 0} pageviews this week
            </p>
          </div>

          {/* Retention Rate */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-rose-50 dark:bg-rose-950/30 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">30 Days</span>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mb-0.5">Retention Rate</p>
            <h3 className="text-xl sm:text-2xl font-bold leading-none text-zinc-900 dark:text-white">
              {retention.retentionRate || 0}%
            </h3>
            <p className="text-[10px] text-zinc-400 mt-2 font-medium">
              {retention.returningVisitors || 0} of {retention.totalVisitors || 0} returned
            </p>
          </div>

          {/* Multiple Returners / Loyal Visitors */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-50 dark:bg-orange-950/30 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Loyal</span>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mb-0.5">High Retention (4+ Visits)</p>
            <h3 className="text-xl sm:text-2xl font-bold leading-none text-zinc-900 dark:text-white">
              {retention.highlyRetainedVisitors || 0}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-2 font-medium">
              Frequent returning audience
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. DETAILED RETENTION BREAKDOWN & TOP VISITED PAGES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Retention Distribution Bar */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Audience Retention Breakdown</h4>
          <p className="text-xs text-zinc-400 mb-4">Comparison of first-time visitors vs repeat buyers & browsers</p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-zinc-600 dark:text-zinc-300">New Visitors (1 visit)</span>
                <span className="text-zinc-900 dark:text-white">{retention.newVisitors || 0}</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${retention.totalVisitors ? Math.round((retention.newVisitors / retention.totalVisitors) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-zinc-600 dark:text-zinc-300">Returning Visitors (2+ visits)</span>
                <span className="text-zinc-900 dark:text-white">{retention.returningVisitors || 0}</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                  style={{ width: `${retention.totalVisitors ? Math.round((retention.returningVisitors / retention.totalVisitors) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-zinc-600 dark:text-zinc-300">Highly Loyal Visitors (4+ visits)</span>
                <span className="text-zinc-900 dark:text-white">{retention.highlyRetainedVisitors || 0}</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all duration-500" 
                  style={{ width: `${retention.totalVisitors ? Math.round((retention.highlyRetainedVisitors / retention.totalVisitors) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Visited Pages */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Most Visited Pages (Last 7 Days)</h4>
          <p className="text-xs text-zinc-400 mb-4">Where your visitors are spending their time</p>

          {analytics.topPages && analytics.topPages.length > 0 ? (
            <div className="space-y-2.5">
              {analytics.topPages.map((page, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[11px] font-bold text-zinc-400 w-4">{idx + 1}.</span>
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{page._id || '/'}</span>
                  </div>
                  <span className="text-xs font-bold text-[#fb5607] bg-[#fb5607]/10 px-2 py-0.5 rounded-lg shrink-0 ml-2">
                    {page.count} views
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-400">
              No pageviews recorded yet. As visitors browse the site, real-time views will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}