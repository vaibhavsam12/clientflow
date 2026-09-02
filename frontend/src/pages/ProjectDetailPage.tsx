import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../services/projects.service';
import { tasksService } from '../services/tasks.service';
import { documentsService } from '../services/documents.service';
import { usersService } from '../services/users.service';
import { activitiesService } from '../services/activities.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Task, TaskStatus } from '../types';
import {
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  FileText,
  History,
  Plus,
  Edit2,
  Trash2,
  Download,
  ArrowLeft,
  LayoutList,
  Columns,
  Clock,
  UserPlus
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { ProjectModal } from '../components/projects/ProjectModal';
import { AddMemberModal } from '../components/projects/AddMemberModal';
import { TaskModal } from '../components/tasks/TaskModal';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { formatDate, formatRelativeTime, formatBytes, formatCurrency } from '../utils/formatters';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'tasks' | 'members' | 'documents' | 'activity'>('tasks');
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'kanban'>('list');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<string>('TODO');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [removeUserId, setRemoveUserId] = useState<string | null>(null);

  const canManage = role === 'ADMIN' || role === 'MANAGER';

  const {
    data: project,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsService.getProject(id!),
    enabled: !!id
  });

  const { data: usersData } = useQuery({
    queryKey: ['users-lookup'],
    queryFn: () => usersService.getUsers({ limit: 100 })
  });

  const { data: projectActivities } = useQuery({
    queryKey: ['project-activities', id],
    queryFn: () => activitiesService.getActivities({ projectId: id, limit: 20 }),
    enabled: !!id && activeTab === 'activity'
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: any) => projectsService.updateProject(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      success('Project updated');
    },
    onError: (err: any) => toastError(err.message || 'Update failed')
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: any) => projectsService.addMember(id!, data.userId, data.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      success('Member added to project roster');
    },
    onError: (err: any) => toastError(err.message || 'Failed to add member')
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectsService.removeMember(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      success('Member removed');
      setRemoveUserId(null);
    },
    onError: (err: any) => toastError(err.message || 'Failed to remove member')
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => tasksService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      success('Task created');
    },
    onError: (err: any) => toastError(err.message || 'Failed to create task')
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) => tasksService.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      success('Task updated');
    },
    onError: (err: any) => toastError(err.message || 'Failed to update task')
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      tasksService.updateStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (err: any) => toastError(err.message || 'Failed to update task status')
  });

  const uploadDocMutation = useMutation({
    mutationFn: (formData: FormData) => documentsService.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      success('Document uploaded');
    },
    onError: (err: any) => toastError(err.message || 'Upload failed')
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !project) {
    return <ErrorState message="Could not load project details." onRetry={refetch} />;
  }

  const progress = project.stats?.progress ?? 0;
  const projectTasks = project.tasks || [];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Projects
      </button>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to={`/clients/${project.clientId}`}
              className="text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded transition"
            >
              {project.client?.name || 'Client Account'}
            </Link>
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </div>

          <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>

          {project.description && (
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{project.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 pt-1">
            {project.startDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Start: {formatDate(project.startDate)}</span>
              </div>
            )}
            {project.targetEndDate && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Deadline: {formatDate(project.targetEndDate)}</span>
              </div>
            )}
            {project.budget && (
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Budget: {formatCurrency(project.budget)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress & Quick Actions */}
        <div className="flex flex-col items-end gap-4 min-w-[220px]">
          <div className="w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span className="font-medium">Deliverables Completion</span>
              <span className="font-bold text-slate-900">{progress}%</span>
            </div>
            <ProgressBar value={progress} size="md" />
            <div className="mt-2 text-[10px] text-slate-400 text-right">
              {project.stats?.completedTasks || 0} of {project.stats?.totalTasks || 0} tasks resolved
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit Scope
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedTask(null);
                    setDefaultTaskStatus('TODO');
                    setIsTaskModalOpen(true);
                  }}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  New Task
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-6 text-xs font-semibold">
          {[
            { id: 'tasks', label: `Tasks (${projectTasks.length})`, icon: CheckCircle2 },
            { id: 'members', label: `Team Members (${project.members?.length || 0})`, icon: Users },
            { id: 'documents', label: `Documents (${project.documents?.length || 0})`, icon: FileText },
            { id: 'activity', label: 'Timeline & History', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 border-b-2 transition -mb-[1px] ${
                  isActive
                    ? 'border-brand-600 text-brand-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'tasks' && (
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setTaskViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium transition ${
                taskViewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTaskViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-medium transition ${
                taskViewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Kanban View"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {taskViewMode === 'list' ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Title</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectTasks.length > 0 ? (
                    projectTasks.map(task => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div
                            onClick={() => {
                              setSelectedTask(task as any);
                              setIsTaskModalOpen(true);
                            }}
                            className="cursor-pointer hover:text-brand-600 transition"
                          >
                            <span className="text-xs font-semibold text-slate-900">{task.title}</span>
                            {task.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1">{task.description}</p>
                            )}
                          </div>
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
                          <StatusBadge status={task.status} />
                        </TableCell>

                        <TableCell className="text-xs text-slate-500">
                          {formatDate(task.dueDate)}
                        </TableCell>

                        <TableCell className="text-right">
                          <button
                            onClick={() => {
                              setSelectedTask(task as any);
                              setIsTaskModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-400">
                        No tasks created in this project yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <KanbanBoard
              tasks={projectTasks as any}
              onTaskClick={t => {
                setSelectedTask(t);
                setIsTaskModalOpen(true);
              }}
              onStatusChange={(taskId, newStatus) => {
                updateTaskStatusMutation.mutate({ taskId, status: newStatus });
              }}
              onAddTask={status => {
                setSelectedTask(null);
                setDefaultTaskStatus(status);
                setIsTaskModalOpen(true);
              }}
            />
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Assigned Team Roster</h3>
            {canManage && (
              <Button
                size="sm"
                onClick={() => setIsAddMemberModalOpen(true)}
                leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              >
                Assign Member
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {project.members && project.members.length > 0 ? (
              project.members.map(member => (
                <Card key={member.id}>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.user.name} src={member.user.avatarUrl} size="md" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{member.user.name}</h4>
                        <p className="text-[11px] text-slate-500">{member.user.email}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    {canManage && (
                      <button
                        onClick={() => setRemoveUserId(member.userId)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition"
                        title="Remove member from project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl">
                No team members assigned yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Project Documents & Assets</h3>
            <Button
              size="sm"
              onClick={() => setIsDocModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Upload Document
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {project.documents && project.documents.length > 0 ? (
              project.documents.map(doc => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{doc.fileName}</h4>
                      <p className="text-[11px] text-slate-500">
                        {formatBytes(doc.fileSize)} • Uploaded {formatRelativeTime(doc.createdAt)} by{' '}
                        {doc.uploadedBy?.name || 'Team member'}
                      </p>
                    </div>
                  </div>

                  <a
                    href={documentsService.getDownloadUrl(doc.id)}
                    download
                    className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-xs text-slate-400">
                No documents uploaded for this project.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Project Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {projectActivities?.data && projectActivities.data.length > 0 ? (
              <div className="space-y-4">
                {projectActivities.data.map(act => (
                  <div key={act.id} className="flex items-start gap-3 text-xs border-b border-slate-100 pb-3 last:border-0">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5">
                      <History className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-800">
                        <span className="font-semibold text-slate-900">{act.actor?.name || 'System'}</span>{' '}
                        {act.action.replace(/_/g, ' ').toLowerCase()}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {formatDate(act.createdAt, 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">No activity logged for this project</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async data => {
          await updateProjectMutation.mutateAsync(data);
        }}
        project={project}
        clients={project.client ? [project.client as any] : []}
        isLoading={updateProjectMutation.isPending}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSubmit={async data => {
          await addMemberMutation.mutateAsync(data);
        }}
        availableUsers={usersData?.data || []}
        isLoading={addMemberMutation.isPending}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={async data => {
          if (selectedTask) {
            await updateTaskMutation.mutateAsync({ taskId: selectedTask.id, data });
          } else {
            await createTaskMutation.mutateAsync(data);
          }
        }}
        task={selectedTask}
        projects={[project]}
        users={usersData?.data || []}
        defaultProjectId={project.id}
        defaultStatus={defaultTaskStatus}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      <DocumentUploadModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSubmit={async data => {
          await uploadDocMutation.mutateAsync(data);
        }}
        clients={project.client ? [project.client as any] : []}
        projects={[project]}
        defaultClientId={project.clientId}
        defaultProjectId={project.id}
        isLoading={uploadDocMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!removeUserId}
        onClose={() => setRemoveUserId(null)}
        onConfirm={() => removeMemberMutation.mutate(removeUserId!)}
        title="Remove Team Member"
        message="Are you sure you want to remove this member from the project roster?"
        confirmText="Remove Member"
        isDestructive={true}
        isLoading={removeMemberMutation.isPending}
      />
    </div>
  );
};
