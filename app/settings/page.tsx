'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/contexts/ToastContext';
import { RefreshCw, CheckCircle2, XCircle, ExternalLink, Store, ShieldCheck, Zap } from 'lucide-react';

export default function SettingsPage() {
  const { addToast } = useToast();
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [orderCount, setOrderCount] = useState<number | null>(null);

  const testConnection = async () => {
    setStatus('checking');
    try {
      const res = await fetch('/api/orders?limit=1');
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Failed');
      setOrderCount(data.total ?? null);
      setStatus('ok');
      addToast('WooCommerce connected live!', 'success');
    } catch (err: unknown) {
      setStatus('error');
      addToast((err as Error).message ?? 'Connection failed', 'error');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 pt-5 pb-10 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            Settings & Store Connection
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Manage your live WooCommerce connection
          </p>
        </div>

        {/* Live Status Card */}
        <SectionCard title="Active WooCommerce Connection">
          <div className="flex items-center gap-3.5 mb-4 p-3 bg-gray-50/80 dark:bg-slate-900/60 rounded-xl border border-gray-100 dark:border-slate-800">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {process.env.NEXT_PUBLIC_WC_STORE_URL || 'WooCommerce Online Store'}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <Zap className="w-3 h-3" />
                Live REST API Synchronized
              </p>
            </div>
            <div className="shrink-0">
              {status === 'ok' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              {status === 'error' && <XCircle className="w-6 h-6 text-rose-500" />}
              {status === 'checking' && (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>

          {status === 'ok' && orderCount !== null && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 px-3.5 py-2.5 rounded-xl mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Connected successfully • {orderCount} orders in store</span>
            </div>
          )}

          {status === 'error' && (
            <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 px-3.5 py-2.5 rounded-xl mb-4">
              Unable to reach WooCommerce. Please verify your credentials in <code className="font-mono">.env.local</code>.
            </div>
          )}

          <button
            onClick={testConnection}
            disabled={status === 'checking'}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status === 'checking' ? 'animate-spin' : ''}`} />
            {status === 'checking' ? 'Checking Connection...' : 'Test Connection Again'}
          </button>
        </SectionCard>

        {/* Dashboard Information */}
        <SectionCard title="About Bobby Customized Dashboard">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 space-y-2.5">
            <p>
              This customized dashboard connects directly to your WooCommerce REST API in real time.
            </p>
            <p className="text-gray-500 dark:text-slate-400">
              • <strong>Fast & Private:</strong> Zero database storage — orders are pulled on-demand directly from your store.
            </p>
            <p className="text-gray-500 dark:text-slate-400">
              • <strong>Mobile Optimized:</strong> Quick call, WhatsApp, and email shortcuts for fast order fulfillment.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
            <a
              href="https://woocommerce.com/document/woocommerce-rest-api/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>WooCommerce REST API Documentation</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </SectionCard>
      </div>
    </AppLayout>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 sm:p-5 mb-4 shadow-sm">
      <h2 className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-3.5">
        {title}
      </h2>
      {children}
    </div>
  );
}
