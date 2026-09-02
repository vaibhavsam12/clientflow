import { z } from 'zod';
import { paginationQuerySchema } from './common.schemas';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name is required').max(150),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Client is required'),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).default('PLANNING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  startDate: z.string().datetime().optional().nullable(),
  targetEndDate: z.string().datetime().optional().nullable(),
  budget: z.number().nonnegative().optional().nullable(),
  memberIds: z.array(z.string()).optional()
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  description: z.string().optional().nullable(),
  clientId: z.string().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  startDate: z.string().datetime().optional().nullable(),
  targetEndDate: z.string().datetime().optional().nullable(),
  actualEndDate: z.string().datetime().optional().nullable(),
  budget: z.number().nonnegative().optional().nullable()
});

export const projectFilterQuerySchema = paginationQuerySchema.extend({
  clientId: z.string().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional()
});

export const addProjectMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['LEAD', 'CONTRIBUTOR', 'OBSERVER']).default('CONTRIBUTOR')
});
