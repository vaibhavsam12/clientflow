import { z } from 'zod';
import { paginationQuerySchema } from './common.schemas';

export const documentFilterQuerySchema = paginationQuerySchema.extend({
  clientId: z.string().optional(),
  projectId: z.string().optional()
});

export const updateDocumentSchema = z.object({
  fileName: z.string().min(1).max(255).optional(),
  clientId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable()
});
