import React from 'react';
import { clsx } from 'clsx';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'red';
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'positive',
  color = 'blue',
  onClick
}) => {
  const iconThemes = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800/60',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60',
    amber: 'bg-amber-50 text-amber-600 border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60',
    purple: 'bg-purple-50 text-purple-600 border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800/60',
    red: 'bg-rose-50 text-rose-600 border-rose-200/60 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800/60'
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group',
        onClick && 'cursor-pointer hover:border-blue-500/50 dark:hover:border-blue-500/50'
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={clsx('p-2.5 rounded-xl border transition-transform duration-200 group-hover:scale-105', iconThemes[color])}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
          {value}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
          {trend && (
            <span
              className={clsx(
                'inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-md text-[11px]',
                trendType === 'positive' && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
                trendType === 'negative' && 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
                trendType === 'neutral' && 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              )}
            >
              {trendType === 'positive' && <ArrowUpRight className="w-3 h-3" />}
              {trendType === 'negative' && <ArrowDownRight className="w-3 h-3" />}
              {trendType === 'neutral' && <Minus className="w-3 h-3" />}
              {trend}
            </span>
          )}
          {subtitle && <span className="truncate">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};
