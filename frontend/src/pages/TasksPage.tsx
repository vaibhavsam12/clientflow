import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '../services/tasks.service';
import { projectsService } from '../services/projects.service';
import { usersService } from '../services/users.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Task, TaskStatus, Project, User } from '../types';
import {
  CheckSquare,
  Plus,
  Search,
  LayoutList,
  Columns,
  Edit2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { TaskModal } from '../components/tasks/TaskModal';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { formatDate } from '../utils/formatters';
import { Link } from 'react-router-dom';

export const TasksPage: React.FC = () => {
  const { role } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [projectIdFilter, setProjectIdFilter] = useState('');
  const [assigneeIdFilter, setAssigneeIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<string>('TODO');
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const canManage = role === 'ADMIN' || role === 'MANAGER';

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [
      'tasks',
      page,
      search,
      projectIdFilter,
      assigneeIdFilter,
      statusFilter,
      priorityFilter,
      overdueOnly,
      viewMode
    ],
    queryFn: () =>
      tasksService.getTasks({
        page: viewMode === 'kanban' ? 1 : page,
        limit: viewMode === 'kanban' ? 100 : 15,
        search: search || undefined,
        projectId: projectIdFilter || undefined,
        assigneeId: assigneeIdFilter || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        overdue: overdueOnly || undefined
      })
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects-lookup'],
    queryFn: () => projectsService.getProjects({ limit: 100 })
  });

  const { data: usersData } = useQuery({
    queryKey: ['users-lookup'],
    queryFn: () => usersService.getUsers({ limit: 100 })
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => tasksService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      success('Task created successfully!');
    },
    onError: (err: any) => toastError(err.message || 'Failed to create task')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => tasksService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      success('Task updated successfully!');
    },
    onError: (err: any) => toastError(err.message || 'Failed to update task')
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => tasksService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (err: any) => toastError(err.message || 'Failed to update status')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      success('Task deleted');
      setDeleteTarget(null);
    },
    onError: (err: any) => toastError(err.message || 'Failed to delete task')
  });

  const handleModalSubmit = async (formData: any) => {
    if (selectedTask) {
      await updateMutation.mutateAsync({ id: selectedTask.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tasks & Work Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational backlog, assignment tracking, priority escalation, and Kanban board
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* List / Kanban View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Kanban
            </button>
          </div>

          <Button
            onClick={() => {
              setSelectedTask(null);
              setDefaultTaskStatus('TODO');
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            size="md"
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex items-center gap-2 w-full lg:w-auto">
          <select
            value={projectIdFilter}
            onChange={e => {
              setProjectIdFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Projects</option>
            {projectsData?.data.map((p: Project) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={assigneeIdFilter}
            onChange={e => {
              setAssigneeIdFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Assignees</option>
            {usersData?.data.map((u: User) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {viewMode === 'list' && (
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="BLOCKED">Blocked</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          )}

          <select
            value={priorityFilter}
            onChange={e => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            onClick={() => {
              setOverdueOnly(!overdueOnly);
              setPage(1);
            }}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
              overdueOnly
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Overdue Only
          </button>
        </div>
      </div>

      {/* Main Content View (List vs Kanban) */}
      {error ? (
        <ErrorState message="Could not load tasks." onRetry={refetch} />
      ) : isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={data?.data || []}
          onTaskClick={(task: Task) => {
            setSelectedTask(task);
            setIsModalOpen(true);
          }}
          onStatusChange={(id: string, status: TaskStatus) => updateStatusMutation.mutate({ id, status })}
          onAddTask={(status: TaskStatus) => {
            setSelectedTask(null);
            setDefaultTaskStatus(status);
            setIsModalOpen(true);
          }}
        />
      ) : data?.data && data.data.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Title</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((task: Task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

                return (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div
                        onClick={() => {
                          setSelectedTask(task);
                          setIsModalOpen(true);
                        }}
                        className="cursor-pointer hover:text-brand-600 transition"
                      >
                        <span className="text-xs font-semibold text-slate-900">{task.title}</span>
                        {task.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{task.description}</p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Link
                        to={`/projects/${task.projectId}`}
                        className="text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 px-2 py-0.5 rounded truncate max-w-[140px] inline-block transition"
                      >
                        {task.project?.name || 'Project'}
                      </Link>
                    </TableCell>

                    <TableCell>
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={task.assignee.name} src={task.assignee.avatarUrl} size="xs" />
                          <span className="text-xs text-slate-700">{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <PriorityBadge priority={task.priority} />
                    </TableCell>

                    <TableCell>
                      <select
                        value={task.status}
                        onChange={e => updateStatusMutation.mutate({ id: task.id, status: e.target.value as TaskStatus })}
                        className="text-xs font-medium rounded-full px-2.5 py-0.5 border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="DONE">Done</option>
                      </select>
                    </TableCell>

                    <TableCell>
                      {task.dueDate ? (
                        <span className={`text-xs font-medium flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                          {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                          {formatDate(task.dueDate)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {canManage && (
                          <button
                            onClick={() => setDeleteTarget(task)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {data.pagination && (
            <Pagination
              meta={data.pagination}
              onPageChange={(p: number) => setPage(p)}
            />
          )}
        </div>
      ) : (
        <EmptyState
          icon={<CheckSquare className="w-8 h-8" />}
          title="No tasks found"
          description={
            search || statusFilter || projectIdFilter || priorityFilter || overdueOnly
              ? 'No tasks match your active filters.'
              : 'Create your first task to start tracking actionable work.'
          }
          actionText="Create Task"
          onAction={() => {
            setSelectedTask(null);
            setDefaultTaskStatus('TODO');
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        task={selectedTask}
        projects={projectsData?.data || []}
        users={usersData?.data || []}
        defaultStatus={defaultTaskStatus}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget!.id)}
        title="Delete Task"
        message={`Are you sure you want to delete task "${deleteTarget?.title}"?`}
        confirmText="Delete Task"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
