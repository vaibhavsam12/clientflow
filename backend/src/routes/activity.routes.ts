import { Router } from 'express';
import { activityController } from '../controllers/activity.controller';
import { authenticate } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validate';
import { activityFilterQuerySchema } from '../schemas/activity.schemas';

const router = Router();

router.use(authenticate);

router.get('/', validateRequest({ query: activityFilterQuerySchema }), activityController.listActivities);

export default router;
