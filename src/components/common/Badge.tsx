import React from 'react';
import { clsx } from 'clsx';
import { CardStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className,
  dot = false
}) => {
  const variants = {
    success:
      'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
    warning:
      'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
    danger:
      'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
    info:
      'bg-cyan-50 text-cyan-700 border-cyan-200/80 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800/60',
    purple:
      'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
    blue:
      'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
    neutral:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  };

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-cyan-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    neutral: 'bg-slate-400'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg border whitespace-nowrap select-none font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])} />}
      {children}
    </span>
  );
};

export const CardStatusBadge: React.FC<{ status: CardStatus }> = ({ status }) => {
  switch (status) {
    case 'active':
      return <Badge variant="success" dot>Active</Badge>;
    case 'pending':
      return <Badge variant="warning" dot>Pending</Badge>;
    case 'expired':
      return <Badge variant="danger" dot>Expired</Badge>;
    case 'suspended':
      return <Badge variant="danger" dot>Suspended</Badge>;
    case 'replaced':
      return <Badge variant="info" dot>Replaced</Badge>;
    case 'lost':
      return <Badge variant="danger" dot>Lost</Badge>;
    case 'cancelled':
      return <Badge variant="neutral" dot>Cancelled</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};
