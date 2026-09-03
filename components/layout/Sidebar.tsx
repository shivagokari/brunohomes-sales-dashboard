'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Settings,
  RefreshCw,
  Store,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 z-20">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-slate-800">
        <div className="h-10 w-12 rounded-xl bg-black border border-gray-800 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Bruno Homes" className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 dark:text-white text-sm truncate leading-snug">Bobby Dashboard</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide">Bruno Homes</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700">
        <p className="text-xs text-gray-400 dark:text-slate-500">WooCommerce Sync</p>
        <div className="flex items-center gap-1 mt-1">
          <RefreshCw className="w-3 h-3 text-green-500" />
          <p className="text-xs text-green-600 dark:text-green-400">Live</p>
        </div>
      </div>
    </aside>
  );
}
