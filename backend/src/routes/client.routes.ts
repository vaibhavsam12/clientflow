import { Router } from 'express';
import { clientController } from '../controllers/client.controller';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';
import { validateRequest } from '../middleware/validate';
import {
  createClientSchema,
  updateClientSchema,
  createContactSchema,
  clientFilterQuerySchema
} from '../schemas/client.schemas';
import { idParamSchema } from '../schemas/common.schemas';

const router = Router();

router.use(authenticate);

router.get('/', validateRequest({ query: clientFilterQuerySchema }), clientController.listClients);
router.get('/:id', validateRequest({ params: idParamSchema }), clientController.getClient);

// Create / Update / Archive clients (Admin & Manager)
router.post(
  '/',
  requireRole(['ADMIN', 'MANAGER']),
  validateRequest({ body: createClientSchema }),
  clientController.createClient
);

router.patch(
  '/:id',
  requireRole(['ADMIN', 'MANAGER']),
  validateRequest({ params: idParamSchema, body: updateClientSchema }),
  clientController.updateClient
);

router.delete(
  '/:id',
  requireRole(['ADMIN']),
  validateRequest({ params: idParamSchema }),
  clientController.archiveClient
);

// Contacts management
router.post(
  '/:id/contacts',
  requireRole(['ADMIN', 'MANAGER']),
  validateRequest({ params: idParamSchema, body: createContactSchema }),
  clientController.addContact
);

router.delete(
  '/:id/contacts/:contactId',
  requireRole(['ADMIN', 'MANAGER']),
  clientController.deleteContact
);

export default router;
