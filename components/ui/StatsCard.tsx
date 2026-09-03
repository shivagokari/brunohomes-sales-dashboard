'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  sub?: ReactNode;
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50 dark:bg-blue-950/50',
  sub,
}: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm hover:shadow transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
          {value}
        </p>
        {sub && <div className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
