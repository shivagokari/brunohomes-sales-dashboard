'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import OrderCard from '@/components/ui/OrderCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { Search, RefreshCw, X, SlidersHorizontal } from 'lucide-react';
import type { OrderListItem } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const STATUS_FILTERS = [
  { key: 'all', label: 'All Orders' },
  { key: 'processing', label: 'Processing' },
  { key: 'pending', label: 'Pending' },
  { key: 'on-hold', label: 'On Hold' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'failed', label: 'Failed' },
] as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchOrders = useCallback(async (resetPage = true) => {
    const pageNum = resetPage ? 1 : page + 1;
    if (!resetPage) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: '20',
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(status !== 'all' ? { status } : {}),
      });
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      const newOrders: OrderListItem[] = data.orders ?? [];

      if (resetPage) {
        setOrders(newOrders);
        setPage(1);
      } else {
        setOrders((prev) => [...prev, ...newOrders]);
        setPage(pageNum);
      }
      setTotal(data.total ?? 0);
      setLastSynced(data.lastSynced ?? null);
      setHasMore(newOrders.length === 20);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, status, page]);

  // Reset on filter/search change
  useEffect(() => {
    fetchOrders(true);
  }, [debouncedSearch, status]);

  // Infinite scroll observer
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchOrders(false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, fetchOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders(true);
  };

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 pt-5 pb-8 max-w-5xl mx-auto">
        {/* Sticky-feel Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-12 rounded-xl bg-black border border-gray-800 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Bruno Homes" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white truncate">
                Orders
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                {total > 0 ? `${total} total orders` : 'Loading orders...'}
                {lastSynced && ` • Live sync ${formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}`}
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Sync Now</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search order #, customer name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Horizontal Status Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {STATUS_FILTERS.map((s) => {
            const isSelected = status === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setStatus(s.key)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700/80 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title={search || status !== 'all' ? 'No orders match your filters' : 'No orders found'}
            description={
              search || status !== 'all'
                ? 'Try searching by a different term or clearing your status filter.'
                : 'Your WooCommerce store does not currently have any orders in this category.'
            }
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}

            {/* Infinite scroll loader / end state */}
            <div ref={loaderRef} className="py-6 flex flex-col items-center justify-center text-xs text-gray-400">
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading more orders...</span>
                </div>
              ) : !hasMore ? (
                <span>All {total} orders loaded</span>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
