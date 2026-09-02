import { Router } from 'express';
import multer from 'multer';
import { documentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';
import { validateRequest } from '../middleware/validate';
import { documentFilterQuerySchema } from '../schemas/document.schemas';
import { idParamSchema } from '../schemas/common.schemas';
import { config } from '../config';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxFileSize }
});

const router = Router();

router.use(authenticate);

router.get('/', validateRequest({ query: documentFilterQuerySchema }), documentController.listDocuments);
router.post('/upload', upload.single('file'), documentController.upload);
router.get('/:id/download', validateRequest({ params: idParamSchema }), documentController.download);
router.delete(
  '/:id',
  requireRole(['ADMIN', 'MANAGER']),
  validateRequest({ params: idParamSchema }),
  documentController.deleteDocument
);

export default router;
