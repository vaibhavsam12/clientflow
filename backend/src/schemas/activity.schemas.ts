import { z } from 'zod';
import { paginationQuerySchema } from './common.schemas';

export const activityFilterQuerySchema = paginationQuerySchema.extend({
  entityType: z.enum(['CLIENT', 'PROJECT', 'TASK', 'DOCUMENT', 'USER']).optional(),
  entityId: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional()
});
