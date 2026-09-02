import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressBarProps {
  value: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size = 'md',
  showLabel = false,
  className
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const getColorClass = (val: number) => {
    if (val >= 100) return 'bg-emerald-500';
    if (val >= 60) return 'bg-brand-500';
    if (val >= 30) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  return (
    <div className={cn('w-full flex items-center gap-3', className)}>
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50', sizeClasses[size])}>
        <div
          className={cn('h-full transition-all duration-500 rounded-full', getColorClass(clampedValue))}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-700 min-w-[3rem] text-right">
          {clampedValue}%
        </span>
      )}
    </div>
  );
};
