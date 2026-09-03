'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from './StatusBadge';
import type { OrderListItem } from '@/lib/types';
import { formatCurrency, formatOrderForSharing } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { ChevronRight, CreditCard, MapPin, Copy, MessageCircle, Share2 } from 'lucide-react';

interface OrderCardProps {
  order: OrderListItem;
}

export default function OrderCard({ order }: OrderCardProps) {
  const { addToast } = useToast();
  const dateStr = order.wcCreatedAt ?? order.lastWebhookAt;
  const relativeTime = dateStr
    ? formatDistanceToNow(new Date(dateStr), { addSuffix: true })
    : '—';

  const nameParts = order.customerName?.split(' ') ?? [];
  const firstName = nameParts[0];

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const formatted = formatOrderForSharing(order);
    navigator.clipboard.writeText(formatted);
    addToast(`Order #${order.wcOrderId} details copied!`, 'success');
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const formatted = formatOrderForSharing(order);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(formatted)}`;
    window.open(url, '_blank');
  };

  return (
    <Link href={`/orders/${order.id}`} className="block">
      <div className="group bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-100 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-150 active:scale-[0.99]">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900 dark:text-white text-base">
                #{order.wcOrderId}
              </span>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">{relativeTime}</p>
          </div>

          <div className="text-right shrink-0">
            <p className="font-bold text-gray-900 dark:text-white text-lg">
              {formatCurrency(order.total)}
            </p>
          </div>
        </div>

        {/* Customer info & Location */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-50 dark:border-slate-800/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                {(firstName?.[0] ?? order.customerEmail?.[0] ?? '?')}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                {order.customerName || order.customerEmail || 'Guest Customer'}
              </p>
              {order.shippingCity ? (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 truncate">
                  <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="truncate">{order.shippingCity}{order.shippingState ? `, ${order.shippingState}` : ''}</span>
                </div>
              ) : order.customerEmail ? (
                <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{order.customerEmail}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            {order.paymentMethodTitle && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 dark:bg-slate-700/60 text-gray-600 dark:text-slate-300">
                <CreditCard className="w-3 h-3 text-gray-400" />
                {order.paymentMethodTitle}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Quick Action Buttons: Copy & WhatsApp Share */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          {order.paymentMethodTitle ? (
            <div className="sm:hidden flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500 truncate">
              <CreditCard className="w-3 h-3 shrink-0" />
              <span className="capitalize truncate">{order.paymentMethodTitle}</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/60 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 active:scale-95 transition-all border border-gray-200/60 dark:border-slate-700/60"
              title="Copy Order in standard format"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 active:scale-95 transition-all border border-emerald-200/60 dark:border-emerald-900/50"
              title="Share Order via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
