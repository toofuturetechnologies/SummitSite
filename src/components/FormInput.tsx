'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, helperText, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-sky-900 dark:text-sky-100 dark:text-sky-100 dark:text-sky-100 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5 border-2 rounded-lg',
          'text-sky-900 dark:text-sky-100 dark:text-sky-100 placeholder-sky-400',
          'bg-white dark:bg-slate-900 dark:bg-slate-900 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-sky-50 dark:bg-slate-800 dark:bg-slate-800',
          'dark:text-sky-100 dark:placeholder-slate-500',
          'dark:bg-slate-900 dark:focus:ring-sky-400/20 dark:focus:bg-slate-800',
          error && 'border-red-500 focus:ring-red-500/20 dark:border-red-600',
          !error && 'border-sky-200 dark:border-slate-700 dark:border-slate-700 focus:border-sky-500 dark:border-slate-700 dark:focus:border-sky-400',
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
);

FormInput.displayName = 'FormInput';

export { FormInput };
