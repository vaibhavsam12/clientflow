import { z } from 'zod';
import { paginationQuerySchema } from './common.schemas';

export const createClientSchema = z.object({
  name: z.string().min(2, 'Client name is required').max(100),
  company: z.string().max(100).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  status: z.enum(['LEAD', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).default('ACTIVE'),
  notes: z.string().optional()
});

export const updateClientSchema = createClientSchema.partial();

export const clientFilterQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['LEAD', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional()
});

export const createContactSchema = z.object({
  name: z.string().min(2, 'Contact name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().max(30).optional().or(z.literal('')),
  title: z.string().max(100).optional().or(z.literal('')),
  isPrimary: z.boolean().default(false)
});

export const updateContactSchema = createContactSchema.partial();
