import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Task, Project, User } from '../../types';

const taskSchema = z.object({
  title: z.string().min(2, 'Task title is required').max(200),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Please select a project'),
  assigneeId: z.string().optional().or(z.literal('')),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'DONE']),
  dueDate: z.string().optional().or(z.literal('')),
  estimatedHours: z.string().optional().transform(val => (val ? parseFloat(val) : undefined))
});

type TaskFormData = z.infer<typeof taskSchema>;

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  task?: Task | null;
  projects: Project[];
  users: User[];
  defaultProjectId?: string;
  defaultStatus?: string;
  isLoading?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  projects,
  users,
  defaultProjectId,
  defaultStatus,
  isLoading = false
}) => {
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: defaultProjectId || '',
      assigneeId: '',
      priority: 'MEDIUM',
      status: (defaultStatus as any) || 'TODO',
      dueDate: '',
      estimatedHours: undefined
    }
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        projectId: task.projectId,
        assigneeId: task.assigneeId || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        estimatedHours: task.estimatedHours !== undefined && task.estimatedHours !== null ? (task.estimatedHours.toString() as any) : undefined
      });
    } else {
      reset({
        title: '',
        description: '',
        projectId: defaultProjectId || (projects[0]?.id || ''),
        assigneeId: '',
        priority: 'MEDIUM',
        status: (defaultStatus as any) || 'TODO',
        dueDate: '',
        estimatedHours: undefined
      });
    }
  }, [task, projects, defaultProjectId, defaultStatus, reset, isOpen]);

  const handleFormSubmit = async (data: TaskFormData) => {
    const payload = {
      ...data,
      assigneeId: data.assigneeId || null,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null
    };
    await onSubmit(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      description={isEditing ? 'Update task requirements, priority, or assignment' : 'Add an actionable task to a project lifecycle'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Task Title *"
          placeholder="e.g. Implement Stripe Elements & PayPal integration"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Project *"
            error={errors.projectId?.message}
            {...register('projectId')}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>

          <Select
            label="Assignee"
            error={errors.assigneeId?.message}
            {...register('assigneeId')}
          >
            <option value="">Unassigned</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Status"
            error={errors.status?.message}
            options={[
              { value: 'TODO', label: 'To Do' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'BLOCKED', label: 'Blocked' },
              { value: 'IN_REVIEW', label: 'In Review' },
              { value: 'DONE', label: 'Done' }
            ]}
            {...register('status')}
          />

          <Select
            label="Priority"
            error={errors.priority?.message}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' }
            ]}
            {...register('priority')}
          />
        </div>

        <Textarea
          label="Task Description"
          placeholder="Describe implementation specifications, dependencies, or testing criteria..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />

          <Input
            label="Estimated Hours"
            type="number"
            placeholder="16"
            error={errors.estimatedHours?.message}
            {...register('estimatedHours')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
