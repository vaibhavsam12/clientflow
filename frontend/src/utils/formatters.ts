import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { ClientStatus, ProjectStatus, TaskStatus, Priority, UserRole } from '../types';

export function formatDate(dateString?: string | null, formatPattern = 'MMM d, yyyy'): string {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return '—';
    return format(date, formatPattern);
  } catch {
    return '—';
  }
}

export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return '—';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '—';
  }
}

export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getStatusConfig(status: ClientStatus | ProjectStatus | TaskStatus | string) {
  switch (status) {
    // Client Statuses
    case 'ACTIVE':
      return { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
    case 'LEAD':
      return { label: 'Lead', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' };
    case 'ON_HOLD':
      return { label: 'On Hold', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
    case 'COMPLETED':
      return { label: 'Completed', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
    case 'ARCHIVED':
      return { label: 'Archived', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' };

    // Project Statuses
    case 'PLANNING':
      return { label: 'Planning', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' };

    // Task Statuses
    case 'TODO':
      return { label: 'To Do', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
    case 'IN_PROGRESS':
      return { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
    case 'BLOCKED':
      return { label: 'Blocked', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' };
    case 'IN_REVIEW':
      return { label: 'In Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
    case 'DONE':
      return { label: 'Done', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };

    default:
      return { label: status, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
  }
}

export function getPriorityConfig(priority: Priority | string) {
  switch (priority) {
    case 'URGENT':
      return { label: 'Urgent', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', color: '#f43f5e' };
    case 'HIGH':
      return { label: 'High', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', color: '#f97316' };
    case 'MEDIUM':
      return { label: 'Medium', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', color: '#3b82f6' };
    case 'LOW':
      return { label: 'Low', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', color: '#94a3b8' };
    default:
      return { label: priority, bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', color: '#94a3b8' };
  }
}

export function getRoleBadgeConfig(role: UserRole | string) {
  switch (role) {
    case 'ADMIN':
      return { label: 'Admin', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'MANAGER':
      return { label: 'Manager', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'MEMBER':
    default:
      return { label: 'Member', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
}
