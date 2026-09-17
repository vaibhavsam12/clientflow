import React from 'react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, required, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const describedBy = error ? errorId : helperText ? helperId : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-slate-700 mb-1">
            {label}
            {required && <span className="text-rose-500 ml-0.5" aria-hidden="true">*</span>}
            {required && <span className="sr-only"> (required)</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-required={required ? 'true' : undefined}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={cn(
            'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition',
            'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        >
          {options
            ? options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error ? (
          <p id={errorId} role="alert" className="mt-1 text-xs text-rose-600 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1 text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
