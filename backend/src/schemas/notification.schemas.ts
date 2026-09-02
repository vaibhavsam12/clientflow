import { z } from 'zod';
import { paginationQuerySchema } from './common.schemas';

export const notificationFilterQuerySchema = paginationQuerySchema.extend({
  isRead: z.string().optional().transform(val => (val === undefined ? undefined : val === 'true'))
});
