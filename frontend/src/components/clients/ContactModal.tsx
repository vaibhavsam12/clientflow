import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const contactSchema = z.object({
  name: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  title: z.string().optional(),
  isPrimary: z.boolean().default(false)
});

type ContactFormData = z.infer<typeof contactSchema>;

export interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContactFormData) => Promise<void>;
  isLoading?: boolean;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      title: '',
      isPrimary: false
    }
  });

  const handleFormSubmit = async (data: ContactFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Client Contact"
      description="Add a stakeholder or key contact person for this client"
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Full Name *"
          placeholder="e.g. David Vance"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email Address *"
          type="email"
          placeholder="dvance@apexretail.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Job Title / Role"
            placeholder="e.g. VP of Digital Commerce"
            error={errors.title?.message}
            {...register('title')}
          />

          <Input
            label="Phone Number"
            placeholder="+1 (555) 019-2834"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isPrimary"
            className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500"
            {...register('isPrimary')}
          />
          <label htmlFor="isPrimary" className="text-xs font-medium text-slate-700">
            Set as Primary Point of Contact
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Add Contact
          </Button>
        </div>
      </form>
    </Modal>
  );
};
