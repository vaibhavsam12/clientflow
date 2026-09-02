import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Project, Client } from '../../types';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required').max(150),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Please select a client'),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  startDate: z.string().optional().or(z.literal('')),
  targetEndDate: z.string().optional().or(z.literal('')),
  budget: z.string().optional().transform(val => (val ? parseFloat(val) : undefined))
});

type ProjectFormData = z.infer<typeof projectSchema>;

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  project?: Project | null;
  clients: Client[];
  defaultClientId?: string;
  isLoading?: boolean;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  clients,
  defaultClientId,
  isLoading = false
}) => {
  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      clientId: defaultClientId || '',
      status: 'PLANNING',
      priority: 'MEDIUM',
      startDate: '',
      targetEndDate: '',
      budget: undefined
    }
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || '',
        clientId: project.clientId,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        targetEndDate: project.targetEndDate ? project.targetEndDate.split('T')[0] : '',
        budget: project.budget !== undefined && project.budget !== null ? (project.budget.toString() as any) : undefined
      });
    } else {
      reset({
        name: '',
        description: '',
        clientId: defaultClientId || (clients[0]?.id || ''),
        status: 'PLANNING',
        priority: 'MEDIUM',
        startDate: '',
        targetEndDate: '',
        budget: undefined
      });
    }
  }, [project, clients, defaultClientId, reset, isOpen]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    const payload = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
      targetEndDate: data.targetEndDate ? new Date(data.targetEndDate).toISOString() : null
    };
    await onSubmit(payload);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Create New Project'}
      description={isEditing ? 'Update project scope, priority, and timeline' : 'Initialize a new project lifecycle under a client'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Project Name *"
          placeholder="e.g. E-Commerce Platform Redesign 2.0"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Client Organization *"
            error={errors.clientId?.message}
            {...register('clientId')}
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            label="Status"
            error={errors.status?.message}
            options={[
              { value: 'PLANNING', label: 'Planning' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'ON_HOLD', label: 'On Hold' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'ARCHIVED', label: 'Archived' }
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
          label="Project Scope & Description"
          placeholder="Describe deliverables, technical architecture goals, and acceptance criteria..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />

          <Input
            label="Target End Date"
            type="date"
            error={errors.targetEndDate?.message}
            {...register('targetEndDate')}
          />

          <Input
            label="Budget (USD)"
            type="number"
            placeholder="75000"
            error={errors.budget?.message}
            {...register('budget')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
