'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/contexts/ToastContext';
import {
  ArrowLeft,
  Phone,
  Mail,
  Package,
  CreditCard,
  Truck,
  User,
  StickyNote,
  Copy,
  MessageCircle,
  Clock,
} from 'lucide-react';
import type { Order } from '@/lib/types';
import { formatCurrency, formatOrderForSharing } from '@/lib/utils';
import { format } from 'date-fns';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrder(data);
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopyOrder = () => {
    if (!order) return;
    const formatted = formatOrderForSharing(order);
    navigator.clipboard.writeText(formatted);
    addToast(`Order #${order.wcOrderId} details copied in standard format!`, 'success');
  };

  const handleWhatsAppShare = () => {
    if (!order) return;
    const formatted = formatOrderForSharing(order);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(formatted)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-medium">Fetching order details...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !order) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
          <p className="text-sm text-gray-500 dark:text-slate-400">{error || 'Order not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
          >
            ← Back to orders
          </button>
        </div>
      </AppLayout>
    );
  }

  const dateStr = order.wcCreatedAt ?? order.createdAt;
  const customerName =
    order.customerName ||
    `${order.billingFirstName ?? ''} ${order.billingLastName ?? ''}`.trim() ||
    'Guest';

  // Clean phone number for direct customer chat
  const cleanPhone = (order.billingPhone || order.shippingPhone || '').replace(/\D/g, '');

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 pb-12">
        {/* Top bar with back button & order summary */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Order #{order.wcOrderId}
                </h1>
                <button
                  onClick={handleCopyOrder}
                  className="text-gray-400 hover:text-blue-600 dark:hover:text-white p-1 transition-colors"
                  title="Copy Order in standard format"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {format(new Date(dateStr), 'd MMM yyyy, h:mm a')}
              </p>
            </div>
          </div>

          <div className="text-right">
            <StatusBadge status={order.status} />
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1">
              {formatCurrency(order.total)}
            </p>
          </div>
        </div>

        {/* Primary Action Buttons: Copy Order & Share to WhatsApp */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={handleCopyOrder}
            className="flex items-center justify-center gap-2 p-3 sm:p-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-blue-500/20"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Order Details</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 p-3 sm:p-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-emerald-500/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Share to WhatsApp</span>
          </button>
        </div>

        {/* Quick Contact Actions with Customer */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {order.billingPhone ? (
            <a
              href={`tel:${order.billingPhone}`}
              className="flex items-center justify-center gap-1.5 p-2.5 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-slate-200 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Call</span>
            </a>
          ) : (
            <div className="flex items-center justify-center p-2.5 bg-gray-50 dark:bg-slate-800/50 rounded-xl text-xs text-gray-400">
              No Phone
            </div>
          )}

          {cleanPhone ? (
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2.5 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-slate-200 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chat</span>
            </a>
          ) : (
            <div className="flex items-center justify-center p-2.5 bg-gray-50 dark:bg-slate-800/50 rounded-xl text-xs text-gray-400">
              No WhatsApp
            </div>
          )}

          {order.customerEmail ? (
            <a
              href={`mailto:${order.customerEmail}`}
              className="flex items-center justify-center gap-1.5 p-2.5 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-slate-200 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>Email</span>
            </a>
          ) : (
            <div className="flex items-center justify-center p-2.5 bg-gray-50 dark:bg-slate-800/50 rounded-xl text-xs text-gray-400">
              No Email
            </div>
          )}
        </div>

        {/* Customer Profile */}
        <Section icon={<User className="w-4 h-4 text-blue-600" />} title="Customer Details">
          <div className="space-y-2">
            <InfoRow label="Name" value={customerName} />
            {order.customerEmail && (
              <InfoRow
                label="Email"
                value={
                  <a href={`mailto:${order.customerEmail}`} className="text-blue-600 hover:underline">
                    {order.customerEmail}
                  </a>
                }
              />
            )}
            {order.billingPhone && (
              <InfoRow
                label="Phone"
                value={
                  <a href={`tel:${order.billingPhone}`} className="text-blue-600 hover:underline">
                    {order.billingPhone}
                  </a>
                }
              />
            )}
          </div>
        </Section>

        {/* Billing + Shipping Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <Section icon={<CreditCard className="w-4 h-4 text-indigo-600" />} title="Billing Details">
            <address className="not-italic text-xs sm:text-sm text-gray-600 dark:text-slate-300 space-y-1">
              {order.billingAddress1 && <p>{order.billingAddress1}</p>}
              {order.billingAddress2 && <p>{order.billingAddress2}</p>}
              <p>
                {[order.billingCity, order.billingState, order.billingPostcode]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              {order.billingCountry && <p className="font-medium text-gray-800 dark:text-slate-200">{order.billingCountry}</p>}
            </address>
            {order.paymentMethodTitle && (
              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-800/80 text-xs text-gray-500 dark:text-slate-400">
                Payment: <span className="font-semibold text-gray-800 dark:text-slate-200">{order.paymentMethodTitle}</span>
              </div>
            )}
          </Section>

          <Section icon={<Truck className="w-4 h-4 text-emerald-600" />} title="Shipping Details">
            <address className="not-italic text-xs sm:text-sm text-gray-600 dark:text-slate-300 space-y-1">
              {(order.shippingAddress1 || order.billingAddress1) && (
                <p>{order.shippingAddress1 || order.billingAddress1}</p>
              )}
              {order.shippingAddress2 && <p>{order.shippingAddress2}</p>}
              <p>
                {[
                  order.shippingCity || order.billingCity,
                  order.shippingState || order.billingState,
                  order.shippingPostcode || order.billingPostcode,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              {(order.shippingCountry || order.billingCountry) && (
                <p className="font-medium text-gray-800 dark:text-slate-200">{order.shippingCountry || order.billingCountry}</p>
              )}
            </address>
            {order.shippingMethod && (
              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-800/80 text-xs text-gray-500 dark:text-slate-400">
                Method: <span className="font-semibold text-gray-800 dark:text-slate-200">{order.shippingMethod}</span>
              </div>
            )}
          </Section>
        </div>

        {/* Customer Note */}
        {order.customerNote && (
          <Section icon={<StickyNote className="w-4 h-4 text-amber-500" />} title="Customer Note">
            <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 italic bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
              "{order.customerNote}"
            </p>
          </Section>
        )}

        {/* Order Items */}
        <Section icon={<Package className="w-4 h-4 text-blue-600" />} title={`Items (${order.lineItems.length})`}>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {order.lineItems.map((item, i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200/80 dark:border-slate-700 shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    Qty: <span className="font-bold text-gray-800 dark:text-slate-200">{item.quantity}</span>
                    {item.sku ? ` • SKU: ${item.sku}` : ''}
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                  {formatCurrency(parseFloat(item.total))}
                </p>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
            <TotalRow label="Subtotal" value={formatCurrency(parseFloat(order.subtotal))} />
            {parseFloat(order.shippingTotal) > 0 && (
              <TotalRow label="Shipping" value={formatCurrency(parseFloat(order.shippingTotal))} />
            )}
            {parseFloat(order.taxTotal) > 0 && (
              <TotalRow label="Tax" value={formatCurrency(parseFloat(order.taxTotal))} />
            )}
            {parseFloat(order.discountTotal) > 0 && (
              <TotalRow
                label="Discount"
                value={`-${formatCurrency(parseFloat(order.discountTotal))}`}
                className="text-emerald-600"
              />
            )}
            <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
              <TotalRow
                label="Total Amount"
                value={formatCurrency(order.total)}
                bold
              />
            </div>
          </div>
        </Section>

        {/* Timeline Footer */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-slate-500 mt-6 px-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Last modified {format(new Date(order.updatedAt || dateStr), 'd MMM yyyy, h:mm a')}</span>
        </div>
      </div>
    </AppLayout>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 sm:p-5 mb-4 shadow-sm">
      <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 mb-3.5">
        {icon}
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-3 py-1.5 border-b border-gray-50 dark:border-slate-800/50 last:border-0 text-xs sm:text-sm">
      <span className="text-gray-500 dark:text-slate-400 shrink-0">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white text-right truncate">{value}</span>
    </div>
  );
}

function TotalRow({
  label,
  value,
  bold = false,
  className = '',
}: {
  label: string;
  value: string;
  bold?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex justify-between text-xs sm:text-sm ${bold ? 'font-bold text-gray-900 dark:text-white text-base' : 'text-gray-500 dark:text-slate-400'} ${className}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
