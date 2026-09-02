import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';
import { validateRequest } from '../middleware/validate';
import { createUserSchema, updateUserSchema } from '../schemas/user.schemas';
import { idParamSchema } from '../schemas/common.schemas';

const router = Router();

// All user management routes require authentication
router.use(authenticate);

router.get('/', userController.listUsers);
router.get('/:id', validateRequest({ params: idParamSchema }), userController.getUser);

// Admin / Manager only can create and update users
router.post(
  '/',
  requireRole(['ADMIN', 'MANAGER']),
  validateRequest({ body: createUserSchema }),
  userController.createUser
);

router.patch(
  '/:id',
  requireRole(['ADMIN', 'MANAGER']),
  validateRequest({ params: idParamSchema, body: updateUserSchema }),
  userController.updateUser
);

export default router;
