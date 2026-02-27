'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  `
    inline-flex items-center justify-center whitespace-nowrap rounded-lg 
    text-sm font-semibold transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2
    dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950
    disabled:pointer-events-none disabled:opacity-50
  `,
  {
    variants: {
      variant: {
        primary: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-md hover:shadow-lg dark:bg-orange-600 dark:hover:bg-orange-700 dark:active:bg-orange-800',
        secondary: 'bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 shadow-md hover:shadow-lg dark:bg-sky-600 dark:hover:bg-sky-700 dark:active:bg-sky-800',
        outline: 'border-2 border-sky-500 text-sky-900 bg-white hover:bg-sky-50 hover:border-sky-600 dark:border-sky-400 dark:text-sky-100 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:border-sky-300',
        ghost: 'text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:text-sky-400 dark:hover:text-sky-300 dark:hover:bg-slate-800',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = 'Button';

export { Button, buttonVariants };
