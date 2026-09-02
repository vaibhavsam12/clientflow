import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { User } from '../../types';

const memberSchema = z.object({
  userId: z.string().min(1, 'Please select a team member'),
  role: z.enum(['LEAD', 'CONTRIBUTOR', 'OBSERVER'])
});

type MemberFormData = z.infer<typeof memberSchema>;

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormData) => Promise<void>;
  availableUsers: User[];
  isLoading?: boolean;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableUsers,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      userId: availableUsers[0]?.id || '',
      role: 'CONTRIBUTOR'
    }
  });

  const handleFormSubmit = async (data: MemberFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Project Member"
      description="Assign a team member to this project roster"
      size="sm"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Select
          label="Team Member *"
          error={errors.userId?.message}
          {...register('userId')}
        >
          {availableUsers.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </Select>

        <Select
          label="Project Assignment Role"
          error={errors.role?.message}
          options={[
            { value: 'CONTRIBUTOR', label: 'Contributor (Standard developer/designer)' },
            { value: 'LEAD', label: 'Lead (Technical / Project Lead)' },
            { value: 'OBSERVER', label: 'Observer (Read-only stakeholder)' }
          ]}
          {...register('role')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Assign Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};
