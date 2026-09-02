import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activitiesService } from '../services/activities.service';
import {
  History,
  User,
  Building2,
  Briefcase,
  CheckSquare,
  FileText,
  Filter,
  Clock
} from 'lucide-react';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { formatDate } from '../utils/formatters';

export const ActivityLogPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [entityTypeFilter, setEntityTypeFilter] = useState('');

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['activities-page', page, entityTypeFilter],
    queryFn: () =>
      activitiesService.getActivities({
        page,
        limit: 20,
        entityType: entityTypeFilter || undefined
      })
  });

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'CLIENT':
        return <Building2 className="w-4 h-4 text-indigo-500" />;
      case 'PROJECT':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'TASK':
        return <CheckSquare className="w-4 h-4 text-emerald-500" />;
      case 'DOCUMENT':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'USER':
      default:
        return <User className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatAction = (action: string) => {
    const formatted = action
      .toLowerCase()
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
    if (action.includes('CREATE') || action.includes('ADDED')) {
      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (action.includes('UPDATE') || action.includes('CHANGED') || action.includes('STATUS')) {
      badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (action.includes('ARCHIVE') || action.includes('DELETE') || action.includes('REMOVE')) {
      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (action.includes('LOGIN')) {
      badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }

    return { label: formatted, color: badgeColor };
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Organization Audit Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable timeline of state modifications, administrative events, and operational actions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={entityTypeFilter}
            onChange={e => {
              setEntityTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-2xs font-medium"
          >
            <option value="">All Entities</option>
            <option value="CLIENT">Clients</option>
            <option value="PROJECT">Projects</option>
            <option value="TASK">Tasks</option>
            <option value="DOCUMENT">Documents</option>
            <option value="USER">Users</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      {error ? (
        <ErrorState message="Could not load activity log." onRetry={refetch} />
      ) : isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs w-full">
          <div className="divide-y divide-slate-100">
            {data.data.map(act => {
              const actionInfo = formatAction(act.action);

              return (
                <div
                  key={act.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3.5 hover:bg-slate-50/70 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center flex-shrink-0">
                    {getEntityIcon(act.entityType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {act.actor?.name || 'System User'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${actionInfo.color}`}
                        >
                          {actionInfo.label}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
                          {act.entityType}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 whitespace-nowrap">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span>{formatDate(act.createdAt, 'MMM d, yyyy • h:mm a')}</span>
                      </div>
                    </div>

                    {/* Associated Context & Metadata */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      {act.client && (
                        <div className="flex items-center gap-1 bg-indigo-50/70 text-indigo-800 px-2 py-0.5 rounded-md border border-indigo-100/80">
                          <Building2 className="w-3 h-3 text-indigo-400" />
                          <span className="font-medium">Client: <b>{act.client.name}</b></span>
                        </div>
                      )}
                      {act.project && (
                        <div className="flex items-center gap-1 bg-blue-50/70 text-blue-800 px-2 py-0.5 rounded-md border border-blue-100/80">
                          <Briefcase className="w-3 h-3 text-blue-400" />
                          <span className="font-medium">Project: <b>{act.project.name}</b></span>
                        </div>
                      )}
                    </div>

                    {act.metadata && Object.keys(act.metadata).length > 0 && (
                      <div className="mt-2.5 text-[11px] font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-slate-700 overflow-x-auto">
                        <div className="flex flex-wrap gap-2 items-center">
                          {Object.entries(act.metadata).map(([key, value]) => (
                            <span key={key} className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 shadow-2xs">
                              <span className="text-slate-400 font-semibold">{key}:</span>
                              <span className="text-slate-800 font-bold">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {data.pagination && (
            <Pagination
              meta={data.pagination}
              onPageChange={p => setPage(p)}
            />
          )}
        </div>
      ) : (
        <EmptyState
          icon={<History className="w-8 h-8" />}
          title="No activity events recorded"
          description="System events will appear here as users perform operational actions."
        />
      )}
    </div>
  );
};
