import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';
import { validateRequest } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  projectFilterQuerySchema,
  addProjectMemberSchema
} from '../schemas/project.schemas';
import { idParamSchema } from '../schemas/common.schemas';

const router = Router();

router.use(authenticate);

router.get('/', validateRequest({ query: projectFilterQuerySchema }), projectController.listProjects);
router.get('/:id', validateRequest({ params: idParamSchema }), projectController.getProject);

// Create / Update / Archive projects (Admin & Manager)
router.post(
  '/',
  requireRole(['ADMIN', 'MANAGER']),
  validateRequest({ body: createProjectSchema }),
  projectController.createProject
);

router.patch(
  '/:id',
  requireRole(['ADMIN', 'MANAGER']),
  validateRequest({ params: idParamSchema, body: updateProjectSchema }),
  projectController.updateProject
);

router.delete(
  '/:id',
  requireRole(['ADMIN']),
  validateRequest({ params: idParamSchema }),
  projectController.archiveProject
);

// Member assignment
router.post(
  '/:id/members',
  requireRole(['ADMIN', 'MANAGER']),
  validateRequest({ params: idParamSchema, body: addProjectMemberSchema }),
  projectController.addMember
);

router.delete(
  '/:id/members/:userId',
  requireRole(['ADMIN', 'MANAGER']),
  projectController.removeMember
);

export default router;
