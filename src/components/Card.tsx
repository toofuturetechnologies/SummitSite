'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg transition-all duration-200',
        variant === 'default' && 'bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700 hover:border-sky-300 dark:bg-slate-900 dark:border-slate-700 dark:hover:border-slate-600',
        variant === 'elevated' && 'bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-sky-300 transition-all dark:bg-slate-900 dark:border-slate-700 dark:shadow-lg dark:hover:shadow-xl dark:hover:border-slate-600',
        variant === 'outlined' && 'bg-sky-50 dark:bg-slate-800 border-2 border-sky-200 dark:border-slate-700 hover:border-sky-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600',
        className
      )}
      {...props}
    />
  )
);

Card.displayName = 'Card';

export { Card };
