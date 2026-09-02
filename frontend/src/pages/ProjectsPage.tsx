import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../services/projects.service';
import { clientsService } from '../services/clients.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Project, Client } from '../types';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { ProjectModal } from '../components/projects/ProjectModal';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { formatDate, formatCurrency } from '../utils/formatters';
import { Link } from 'react-router-dom';

export const ProjectsPage: React.FC = () => {
  const { role } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [clientIdFilter, setClientIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const canManage = role === 'ADMIN' || role === 'MANAGER';

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['projects', page, search, clientIdFilter, statusFilter, priorityFilter],
    queryFn: () =>
      projectsService.getProjects({
        page,
        limit: 9,
        search: search || undefined,
        clientId: clientIdFilter || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined
      })
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients-lookup'],
    queryFn: () => clientsService.getClients({ limit: 100 })
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => projectsService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      success('Project created successfully!');
    },
    onError: (err: any) => toastError(err.message || 'Failed to create project')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => projectsService.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      success('Project updated successfully!');
    },
    onError: (err: any) => toastError(err.message || 'Failed to update project')
  });

  const handleModalSubmit = async (formData: any) => {
    if (selectedProject) {
      await updateMutation.mutateAsync({ id: selectedProject.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Project Pipelines</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track project deliverables, execution milestones, assigned team rosters, and budgets
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => {
              setSelectedProject(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            size="md"
          >
            Create Project
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
          <select
            value={clientIdFilter}
            onChange={e => {
              setClientIdFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Clients</option>
            {clientsData?.data.map((c: Client) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {error ? (
        <ErrorState message="Could not load projects." onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {data.data.map((project: Project) => {
              const progress = project.stats?.progress ?? 0;

              return (
                <Card key={project.id} className="flex flex-col justify-between hover:border-brand-300 transition-all hover:shadow-md">
                  <CardContent className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded truncate max-w-[170px]">
                          {project.client?.name || 'Client'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <PriorityBadge priority={project.priority} showIcon={false} className="text-[10px] py-0 px-2" />
                          <StatusBadge status={project.status} className="text-[10px] py-0 px-2" />
                        </div>
                      </div>

                      {/* Project Title & Description */}
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-sm font-bold text-slate-900 hover:text-brand-600 transition leading-snug block"
                      >
                        {project.name}
                      </Link>

                      {project.description && (
                        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>

                    {/* Progress & Metadata */}
                    <div className="mt-5 space-y-3 pt-4 border-t border-slate-100">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                          <span>
                            Progress ({project.stats?.completedTasks || 0}/{project.stats?.totalTasks || 0} tasks)
                          </span>
                          <span className="font-bold text-slate-900">{progress}%</span>
                        </div>
                        <ProgressBar value={progress} size="sm" />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        {/* Assigned Team Avatars */}
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {project.members && project.members.length > 0 ? (
                            project.members.slice(0, 4).map((m: any) => (
                              <Avatar
                                key={m.id}
                                name={m.user.name}
                                src={m.user.avatarUrl}
                                size="xs"
                                className="ring-2 ring-white"
                              />
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No members assigned</span>
                          )}
                          {project.members && project.members.length > 4 && (
                            <span className="w-6 h-6 rounded-full bg-slate-100 ring-2 ring-white text-[10px] font-bold flex items-center justify-center text-slate-600">
                              +{project.members.length - 4}
                            </span>
                          )}
                        </div>

                        {/* End Date */}
                        {project.targetEndDate && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{formatDate(project.targetEndDate, 'MMM d, yyyy')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  {/* Card Action Link */}
                  <div className="px-5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {project.budget ? formatCurrency(project.budget) : 'No Budget Set'}
                    </span>
                    <Link
                      to={`/projects/${project.id}`}
                      className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-800 transition"
                    >
                      Open Project <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          {data.pagination && (
            <Pagination
              meta={data.pagination}
              onPageChange={(p: number) => setPage(p)}
            />
          )}
        </>
      ) : (
        <EmptyState
          icon={<Briefcase className="w-8 h-8" />}
          title="No projects found"
          description={
            search || statusFilter || clientIdFilter || priorityFilter
              ? 'No projects match your active search filters.'
              : 'Create your first project to start organizing team tasks and deliverables.'
          }
          actionText={canManage && !search ? 'Create Project' : undefined}
          onAction={() => {
            setSelectedProject(null);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        project={selectedProject}
        clients={clientsData?.data || []}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
