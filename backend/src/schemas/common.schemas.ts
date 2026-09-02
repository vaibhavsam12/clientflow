import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)).pipe(z.number().min(1).default(1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 10)).pipe(z.number().min(1).max(100).default(10)),
  search: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required')
});
