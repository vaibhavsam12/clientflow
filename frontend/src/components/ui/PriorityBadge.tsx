import React from 'react';
import { getPriorityConfig } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import { AlertCircle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import { Priority } from '../../types';

export interface PriorityBadgeProps {
  priority: Priority | string;
  className?: string;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className, showIcon = true }) => {
  const config = getPriorityConfig(priority);

  const renderIcon = () => {
    switch (priority) {
      case 'URGENT':
        return <AlertCircle className="w-3 h-3 text-rose-600" />;
      case 'HIGH':
        return <ArrowUp className="w-3 h-3 text-orange-600" />;
      case 'MEDIUM':
        return <ArrowRight className="w-3 h-3 text-blue-600" />;
      case 'LOW':
        return <ArrowDown className="w-3 h-3 text-slate-500" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {showIcon && renderIcon()}
      <span>{config.label}</span>
    </span>
  );
};
