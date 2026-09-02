import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import { useToast } from '../context/ToastContext';
import {
  Bell,
  CheckCheck,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { formatRelativeTime } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { success } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [filterRead, setFilterRead] = useState<string>('');

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications-page', page, filterRead],
    queryFn: () =>
      notificationsService.getNotifications({
        page,
        limit: 15,
        isRead: filterRead === '' ? undefined : filterRead === 'true'
      })
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      success('All notifications marked as read');
    }
  });

  const markSingleReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notifications Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System alerts, task assignments, and project milestone updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            leftIcon={<CheckCheck className="w-4 h-4" />}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Filter Inbox
        </span>

        <select
          value={filterRead}
          onChange={e => {
            setFilterRead(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-2xs"
        >
          <option value="">All Notifications</option>
          <option value="false">Unread Only</option>
          <option value="true">Read</option>
        </select>
      </div>

      {/* Notifications List */}
      {error ? (
        <ErrorState message="Could not load notifications." onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map(notif => (
            <Card
              key={notif.id}
              className={`transition-all hover:border-slate-300 ${
                !notif.isRead ? 'border-brand-300 bg-brand-50/20 shadow-2xs' : 'bg-white'
              }`}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    !notif.isRead ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{notif.title}</h4>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                  <div className="mt-3 flex items-center gap-3">
                    {notif.link && (
                      <button
                        onClick={() => {
                          if (!notif.isRead) markSingleReadMutation.mutate(notif.id);
                          navigate(notif.link!);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800"
                      >
                        View Details <ExternalLink className="w-3 h-3" />
                      </button>
                    )}

                    {!notif.isRead && (
                      <button
                        onClick={() => markSingleReadMutation.mutate(notif.id)}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {data.pagination && (
            <Pagination
              meta={data.pagination}
              onPageChange={p => setPage(p)}
            />
          )}
        </div>
      ) : (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="Inbox is clear"
          description="You have no notifications in this view."
        />
      )}
    </div>
  );
};
