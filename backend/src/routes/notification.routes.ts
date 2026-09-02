import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validate';
import { notificationFilterQuerySchema } from '../schemas/notification.schemas';
import { idParamSchema } from '../schemas/common.schemas';

const router = Router();

router.use(authenticate);

router.get('/', validateRequest({ query: notificationFilterQuerySchema }), notificationController.listNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/:id/read', validateRequest({ params: idParamSchema }), notificationController.markAsRead);
router.post('/read-all', notificationController.markAllAsRead);

export default router;
