import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { activitiesService } from '../services/activities.service';
import {
  Building2,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { Avatar } from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats()
  });

  const {
    data: charts,
    isLoading: isChartsLoading
  } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: () => dashboardService.getCharts()
  });

  const {
    data: workload,
    isLoading: isWorkloadLoading
  } = useQuery({
    queryKey: ['dashboard-workload'],
    queryFn: () => dashboardService.getWorkload()
  });

  const {
    data: deadlines,
    isLoading: isDeadlinesLoading
  } = useQuery({
    queryKey: ['dashboard-deadlines'],
    queryFn: () => dashboardService.getDeadlines(5)
  });

  const {
    data: recentActivities,
    isLoading: isActivitiesLoading
  } = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: () => activitiesService.getActivities({ limit: 6 })
  });

  if (statsError) {
    return <ErrorState message="Failed to load dashboard operational statistics." onRetry={refetchStats} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Operations Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline metrics, team velocity, and project health indicators
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-semibold transition"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Projects
          </Link>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Task Board
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Clients */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Clients</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-brand-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-20 mt-2" />
            ) : (
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{stats?.clients.active}</span>
                <span className="text-xs text-slate-500">/ {stats?.clients.total} total</span>
              </div>
            )}
            <div className="mt-3 flex items-center text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>Healthy retention rate</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Projects</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-20 mt-2" />
            ) : (
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{stats?.projects.active}</span>
                <span className="text-xs text-slate-500">({stats?.projects.completed} completed)</span>
              </div>
            )}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Avg. Delivery Progress</span>
                <span className="font-semibold text-slate-800">{stats?.projects.averageProgress}%</span>
              </div>
              <ProgressBar value={stats?.projects.averageProgress || 0} size="sm" />
            </div>
          </CardContent>
        </Card>

        {/* Open Tasks */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Tasks</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-20 mt-2" />
            ) : (
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{stats?.tasks.open}</span>
                <span className="text-xs text-slate-500">/ {stats?.tasks.total} total</span>
              </div>
            )}
            <div className="mt-3 flex items-center text-xs text-brand-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              <span>{stats?.tasks.completedThisMonth || 0} delivered this month</span>
            </div>
          </CardContent>
        </Card>

        {/* Overdue / Attention Tasks */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Tasks</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-20 mt-2" />
            ) : (
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-black ${(stats?.tasks.overdue || 0) > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {stats?.tasks.overdue || 0}
                </span>
                <span className="text-xs text-slate-500">requiring attention</span>
              </div>
            )}
            <div className="mt-3 flex items-center text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Prioritized in task board</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Project & Task Distribution Breakdown + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Pipeline Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project Pipeline & Task Health</CardTitle>
            <Link to="/projects" className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-5">
            {isChartsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Projects by Status
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {charts?.projectsByStatus.map(p => (
                      <div key={p.status} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                        <StatusBadge status={p.status} className="text-[10px] px-2" />
                        <div className="mt-2 text-xl font-bold text-slate-900">{p.count}</div>
                        <span className="text-[10px] text-slate-500">Projects</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Task Status Distribution
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {charts?.tasksByStatus.map(t => (
                      <div key={t.status} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-center">
                        <StatusBadge status={t.status} showDot={false} className="text-[10px] px-1.5" />
                        <div className="mt-1.5 text-lg font-bold text-slate-900">{t.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Urgent & Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <Link to="/tasks" className="text-xs font-semibold text-brand-600 hover:text-brand-800">
              Board
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {isDeadlinesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : deadlines && deadlines.length > 0 ? (
              <div className="space-y-3">
                {deadlines.map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-slate-200 hover:border-brand-300 transition bg-white shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 line-clamp-1">{task.title}</span>
                        <PriorityBadge priority={task.priority} showIcon={false} className="text-[10px] py-0" />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate max-w-[130px] font-medium text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                          {task.project?.name}
                        </span>
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate, 'MMM d')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">No imminent deadlines</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Team Workload + Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Workload */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Team Workload & Velocity</CardTitle>
            <Link to="/users" className="text-xs font-semibold text-brand-600 hover:text-brand-800">
              Manage Team
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isWorkloadLoading ? (
              <div className="p-5 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {workload?.map(member => (
                  <div key={member.userId} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} src={member.avatarUrl} size="md" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{member.name}</div>
                        <span className="text-[10px] text-slate-500 uppercase font-medium">{member.role}</span>
                      </div>
                    </div>

                    <div className="flex-1 max-w-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                        <span>{member.completed} of {member.totalAssigned} tasks done</span>
                        <span className="font-semibold text-slate-900">{member.completionRate}%</span>
                      </div>
                      <ProgressBar value={member.completionRate} size="sm" />
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                        {member.inProgress} In Progress
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {member.pending} Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Audit Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <Link to="/activities" className="text-xs font-semibold text-brand-600 hover:text-brand-800">
              Full Log
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {isActivitiesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recentActivities?.data && recentActivities.data.length > 0 ? (
              <div className="space-y-3.5">
                {recentActivities.data.map(act => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-medium leading-snug">
                        <span className="font-semibold text-slate-900">{act.actor?.name || 'System'}</span>{' '}
                        {act.action.replace(/_/g, ' ').toLowerCase()}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {formatRelativeTime(act.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">No activity recorded</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
