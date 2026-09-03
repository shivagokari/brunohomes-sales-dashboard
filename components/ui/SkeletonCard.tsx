'use client';

export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 animate-pulse">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
            <div className="h-5 w-20 bg-gray-200 dark:bg-slate-700 rounded-full" />
          </div>
          <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  );
}
