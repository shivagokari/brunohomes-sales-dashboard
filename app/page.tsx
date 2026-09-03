'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import StatsCard from '@/components/ui/StatsCard';
import OrderCard from '@/components/ui/OrderCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import {
  ShoppingCart,
  Clock,
  TrendingUp,
  IndianRupee,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { OrderListItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface Stats {
  ordersToday: number;
  pendingCount: number;
  processingCount: number;
  revenueToday: number;
  revenueWeek: number;
  ordersByDay: { date: string; count: number; failed?: number; revenue: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderListItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const fetchRecentOrders = async () => {
    try {
      const res = await fetch('/api/orders?limit=6');
      const data = await res.json();
      setRecentOrders(data.orders ?? []);
    } catch (err) {
      console.error('Failed to load recent orders', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchStats = async (isManual = false) => {
    try {
      const res = await fetch(`/api/stats${isManual ? '?refresh=true' : ''}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.allSettled([fetchRecentOrders(), fetchStats(true)]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRecentOrders();
    fetchStats();
    const interval = setInterval(() => {
      fetchRecentOrders();
      fetchStats();
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Smooth wave animation loop every 6 seconds (gentle, 5-7s interval)
  useEffect(() => {
    const loopTimer = setInterval(() => {
      setAnimKey((k) => k + 1);
    }, 6000);
    return () => clearInterval(loopTimer);
  }, []);

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 pt-4 pb-8 max-w-5xl mx-auto">
        {/* Top Header with Logo */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-13 rounded-xl bg-black border border-gray-800 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Bruno Homes Logo" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white truncate">
                  Bobby Customized Dashboard
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                Bruno Homes • {format(new Date(), 'EEEE, d MMM yyyy')}
              </p>
            </div>
          </div>

          <button
            onClick={refreshAll}
            disabled={refreshing || statsLoading || ordersLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-sm shrink-0"
            title="Refresh live data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing || statsLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Stats Grid - Lightweight & Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-5">
          <StatsCard
            label="Orders Today"
            value={statsLoading ? '—' : stats?.ordersToday ?? 0}
            icon={ShoppingCart}
            iconColor="text-blue-600 dark:text-blue-400"
            iconBg="bg-blue-50 dark:bg-blue-950/60"
            sub="Today's new orders"
          />
          <StatsCard
            label="Processing"
            value={statsLoading ? '—' : stats?.processingCount ?? stats?.pendingCount ?? 0}
            icon={Clock}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50 dark:bg-amber-950/60"
            sub="Awaiting fulfillment"
          />
          <StatsCard
            label="Revenue Today"
            value={statsLoading ? '—' : formatCurrency(stats?.revenueToday ?? 0)}
            icon={IndianRupee}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-50 dark:bg-emerald-950/60"
            sub="Gross sales today"
          />
          <StatsCard
            label="Revenue (7 Days)"
            value={statsLoading ? '—' : formatCurrency(stats?.revenueWeek ?? 0)}
            icon={TrendingUp}
            iconColor="text-indigo-600 dark:text-indigo-400"
            iconBg="bg-indigo-50 dark:bg-indigo-950/60"
            sub="Past 7 days volume"
          />
        </div>

        {/* Analytics Chart with Dual Wave (Blue = Active, Red = Failed) & Smooth Loop */}
        {!statsLoading && stats?.ordersByDay && stats.ordersByDay.length > 0 && (
          <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 sm:p-5 mb-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Order Trends (Last 14 Days)
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Live pulse updates every 6 seconds
                </p>
              </div>

              {/* Legend with Blue & Red wave indicators */}
              <div className="flex items-center gap-3.5 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                  <span>Active Orders</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                  <span>Failed Orders</span>
                </div>
              </div>
            </div>

            <div className="h-44 sm:h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.ordersByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    {/* Blue wave gradient for successful/active orders */}
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>

                    {/* Red wave gradient for failed orders */}
                    <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-slate-700/60" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => {
                      try { return format(new Date(d), 'dd MMM'); } catch { return d; }
                    }}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    labelFormatter={(d) => {
                      try { return format(new Date(d), 'EEEE, d MMM yyyy'); } catch { return d; }
                    }}
                    formatter={(v: number, name: string) => [
                      `${v} orders`,
                      name === 'failed' ? 'Failed Orders' : 'Active Orders',
                    ]}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  />

                  {/* Red Wave: Failed Orders */}
                  <Area
                    key={`failed-${animKey}`}
                    type="monotone"
                    dataKey="failed"
                    name="failed"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    fill="url(#failedGradient)"
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />

                  {/* Blue Wave: Active Orders */}
                  <Area
                    key={`orders-${animKey}`}
                    type="monotone"
                    dataKey="count"
                    name="count"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#chartGradient)"
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Orders Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pt-1">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Recent Orders
            </h2>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
            >
              <span>View all orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {ordersLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 text-sm text-gray-500">
                No orders found.
              </div>
            ) : (
              recentOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
