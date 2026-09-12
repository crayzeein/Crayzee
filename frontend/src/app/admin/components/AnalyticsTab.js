'use client';
import { Eye, Users as UsersIcon, Smartphone, Monitor, Tablet, HelpCircle } from 'lucide-react';

const DEVICE_ICONS = { mobile: Smartphone, desktop: Monitor, tablet: Tablet, unknown: HelpCircle };

// Validated for contrast and colour-vision deficiency on both zinc-50 and zinc-900 surfaces
const SERIES = {
  views: 'bg-[#2563eb] dark:bg-[#3b82f6]',
  visitors: 'bg-[#fb5607] dark:bg-[#ea580c]',
  teal: 'bg-[#0d9488] dark:bg-[#0d9488]',
  violet: 'bg-[#7c3aed] dark:bg-[#8b5cf6]'
};

const Card = ({ title, subtitle, children }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl">
    <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{title}</h4>
    <p className="text-xs text-zinc-400 mb-5">{subtitle}</p>
    {children}
  </div>
);

const Empty = ({ children }) => (
  <div className="py-10 text-center text-xs text-zinc-400">{children}</div>
);

const Legend = ({ items }) => (
  <div className="flex items-center gap-4 mb-5">
    {items.map(([label, color]) => (
      <div key={label} className="flex items-center gap-1.5">
        <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
      </div>
    ))}
  </div>
);

export default function AnalyticsTab({ data }) {
  const analytics = data.analytics || {};
  const retention = analytics.retention || {};
  const trend = analytics.dailyTrend || [];
  const topPages = analytics.topPages || [];
  const devices = analytics.deviceBreakdown || [];

  const peak = Math.max(1, ...trend.map(d => d.pageviews || 0));
  const topPageMax = Math.max(1, ...topPages.map(p => p.count || 0));
  const deviceTotal = devices.reduce((sum, d) => sum + d.count, 0);

  const total = retention.totalVisitors || 0;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const newPct = pct(retention.newVisitors || 0);
  const returningPct = pct(retention.returningVisitors || 0);

  return (
    <div className="space-y-4">
      <Card title="Daily Traffic (Last 7 Days)" subtitle="Pageviews against the number of distinct people behind them">
        <Legend items={[['Pageviews', SERIES.views], ['Unique visitors', SERIES.visitors]]} />
        {trend.length > 0 ? (
          <div className="flex items-end gap-2 h-44">
            {trend.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div className="relative w-full flex-1 flex items-end justify-center gap-[2px]">
                  <div
                    className={`w-1/2 max-w-6 rounded-t ${SERIES.views} transition-all`}
                    style={{ height: `${Math.max(2, ((day.pageviews || 0) / peak) * 100)}%` }}
                  />
                  <div
                    className={`w-1/2 max-w-6 rounded-t ${SERIES.visitors} transition-all`}
                    style={{ height: `${Math.max(2, ((day.uniqueVisitors || 0) / peak) * 100)}%` }}
                  />
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-semibold px-2 py-1 rounded-lg shadow-lg">
                    {day.pageviews} views · {day.uniqueVisitors} visitors
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium tabular-nums">
                  {new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Empty>No traffic recorded yet. Visits appear here within a few minutes of someone browsing.</Empty>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Audience Retention" subtitle="Every tracked visitor of the last 30 days, split by how often they came back">
          {total > 0 ? (
            <>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-zinc-900 dark:text-white tabular-nums">{retention.retentionRate || 0}%</span>
                <span className="text-xs text-zinc-400">came back at least once</span>
              </div>

              {/* New and returning are exclusive, so one bar holds the whole audience */}
              <div className="flex w-full h-3 rounded-full overflow-hidden gap-[2px] mb-4">
                <div className={SERIES.views} style={{ width: `${newPct}%` }} />
                <div className={SERIES.visitors} style={{ width: `${returningPct}%` }} />
              </div>

              <div className="space-y-3">
                {[
                  ['New visitors', 'Came once', retention.newVisitors || 0, newPct, SERIES.views],
                  ['Returning visitors', 'Came back 2 or more times', retention.returningVisitors || 0, returningPct, SERIES.visitors]
                ].map(([label, hint, value, percent, color]) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{label}</p>
                      <p className="text-[10px] text-zinc-400">{hint}</p>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white tabular-nums shrink-0">{value}</span>
                    <span className="text-[10px] text-zinc-400 tabular-nums w-8 text-right shrink-0">{percent}%</span>
                  </div>
                ))}
              </div>

              {/* Loyal visitors sit inside the returning group, so they get a nested row rather than a third slice */}
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2.5">
                <UsersIcon size={13} className="text-zinc-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Highly loyal</p>
                  <p className="text-[10px] text-zinc-400">Visited 4 or more times — part of the returning group above</p>
                </div>
                <span className="text-sm font-bold text-zinc-900 dark:text-white tabular-nums shrink-0">
                  {retention.highlyRetainedVisitors || 0}
                </span>
              </div>
            </>
          ) : (
            <Empty>No visitors tracked yet.</Empty>
          )}
        </Card>

        <Card title="Most Visited Pages" subtitle="Where visitors spent their time over the last 7 days">
          {topPages.length > 0 ? (
            <div className="space-y-3">
              {topPages.map((page, idx) => (
                <div key={page._id || idx}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {page._id || '/'}
                    </span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white tabular-nums shrink-0">
                      {page.count}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${SERIES.visitors}`}
                      style={{ width: `${Math.max(3, (page.count / topPageMax) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty>No pageviews recorded yet.</Empty>
          )}
        </Card>
      </div>

      <Card title="Devices" subtitle="What people are browsing on — useful for deciding where to test first">
        {deviceTotal > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {devices.map((device) => {
              const Icon = DEVICE_ICONS[device._id] || HelpCircle;
              const share = Math.round((device.count / deviceTotal) * 100);
              return (
                <div key={device._id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <Icon size={16} className="text-zinc-400 mb-2.5" />
                  <p className="text-xl font-bold text-zinc-900 dark:text-white leading-none tabular-nums">{share}%</p>
                  <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 mt-1.5 capitalize">{device._id || 'unknown'}</p>
                  <p className="text-[10px] text-zinc-400 tabular-nums">{device.count} views</p>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty>No device data yet.</Empty>
        )}
      </Card>
    </div>
  );
}
