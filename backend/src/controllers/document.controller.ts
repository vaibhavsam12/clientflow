import { Request, Response, NextFunction } from 'express';
import { documentService } from '../services/document.service';
import { apiResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export const documentController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('No file provided in request payload.');
      }

      const document = await documentService.uploadDocument({
        file: req.file,
        clientId: req.body.clientId || undefined,
        projectId: req.body.projectId || undefined,
        uploadedById: req.user!.userId
      });

      return apiResponse.created(res, document, 'Document uploaded successfully');
    } catch (error) {
      next(error);
    }
  },

  async listDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await documentService.listDocuments({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 15,
        clientId: req.query.clientId as string,
        projectId: req.query.projectId as string,
        search: req.query.search as string
      });
      return apiResponse.paginated(res, result);
    } catch (error) {
      next(error);
    }
  },

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const { path, document } = await documentService.getDownloadPath(req.params.id);
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
      res.setHeader('Content-Type', document.mimeType);
      return res.sendFile(path);
    } catch (error) {
      next(error);
    }
  },

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await documentService.deleteDocument(req.params.id, req.user?.userId);
      return apiResponse.success(res, result, 'Document deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};
