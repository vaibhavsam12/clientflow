import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, leftIcon, rightIcon, children, type = 'button', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none min-h-[38px]';

    const variants = {
      primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs focus-visible:ring-brand-500 border border-transparent active:bg-brand-800',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 focus-visible:ring-slate-400 border border-slate-200/80 active:bg-slate-300',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus-visible:ring-rose-500 border border-transparent active:bg-rose-800',
      outline: 'bg-transparent hover:bg-slate-50 text-slate-700 border border-slate-300 focus-visible:ring-brand-500 active:bg-slate-100',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-400'
    };

    const sizes = {
      sm: 'px-2.5 py-1.5 text-xs gap-1.5 min-h-[32px]',
      md: 'px-3.5 py-2 text-sm gap-2 min-h-[38px]',
      lg: 'px-5 py-2.5 text-base gap-2.5 min-h-[44px]'
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? 'true' : undefined}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />}
        {!isLoading && leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
