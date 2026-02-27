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
        variant === 'default' && 'bg-white border border-sky-200 hover:border-sky-300',
        variant === 'elevated' && 'bg-white border border-sky-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all',
        variant === 'outlined' && 'bg-sky-50 border-2 border-sky-200 hover:border-sky-300',
        className
      )}
      {...props}
    />
  )
);

Card.displayName = 'Card';

export { Card };
