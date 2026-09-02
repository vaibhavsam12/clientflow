import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';
import { validateRequest } from '../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskFilterQuerySchema
} from '../schemas/task.schemas';
import { idParamSchema } from '../schemas/common.schemas';

const router = Router();

router.use(authenticate);

router.get('/', validateRequest({ query: taskFilterQuerySchema }), taskController.listTasks);
router.get('/:id', validateRequest({ params: idParamSchema }), taskController.getTask);

// Any authenticated member can create a task
router.post('/', validateRequest({ body: createTaskSchema }), taskController.createTask);

// Update task details
router.patch(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateTaskSchema }),
  taskController.updateTask
);

// Quick status change endpoint (for Kanban board drag & status updates)
router.patch(
  '/:id/status',
  validateRequest({ params: idParamSchema, body: updateTaskStatusSchema }),
  taskController.updateTaskStatus
);

// Delete task (Admin & Manager)
router.delete(
  '/:id',
  requireRole(['ADMIN', 'MANAGER']),
  validateRequest({ params: idParamSchema }),
  taskController.deleteTask
);

export default router;
