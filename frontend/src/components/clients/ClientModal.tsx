import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Client } from '../../types';

const clientSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters'),
  company: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Must be a valid URL (e.g. https://example.com)').optional().or(z.literal('')),
  address: z.string().optional(),
  status: z.enum(['LEAD', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']),
  notes: z.string().optional()
});

type ClientFormData = z.infer<typeof clientSchema>;

export interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
  client?: Client | null;
  isLoading?: boolean;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  client,
  isLoading = false
}) => {
  const isEditing = !!client;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      status: 'ACTIVE',
      notes: ''
    }
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        company: client.company || '',
        email: client.email || '',
        phone: client.phone || '',
        website: client.website || '',
        address: client.address || '',
        status: client.status,
        notes: client.notes || ''
      });
    } else {
      reset({
        name: '',
        company: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        status: 'ACTIVE',
        notes: ''
      });
    }
  }, [client, reset, isOpen]);

  const handleFormSubmit = async (data: ClientFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Client' : 'Create New Client'}
      description={isEditing ? 'Update client organization details' : 'Add a new client account to ClientFlow'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Client Name *"
            placeholder="e.g. Apex Retail Innovations"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Company / Parent Entity"
            placeholder="e.g. Apex Holdings LLC"
            error={errors.company?.message}
            {...register('company')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="partnerships@apexretail.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Phone Number"
            placeholder="+1 (555) 019-2834"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Website URL"
            placeholder="https://apexretail.com"
            error={errors.website?.message}
            {...register('website')}
          />

          <Select
            label="Account Status"
            error={errors.status?.message}
            options={[
              { value: 'LEAD', label: 'Lead' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'ON_HOLD', label: 'On Hold' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'ARCHIVED', label: 'Archived' }
            ]}
            {...register('status')}
          />
        </div>

        <Input
          label="Physical Address"
          placeholder="100 Enterprise Way, Suite 400, San Francisco, CA"
          error={errors.address?.message}
          {...register('address')}
        />

        <Textarea
          label="Internal Notes"
          placeholder="Key account objectives, contract milestones, SLA terms..."
          rows={3}
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Client'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
