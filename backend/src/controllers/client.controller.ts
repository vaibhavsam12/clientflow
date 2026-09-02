import { Request, Response, NextFunction } from 'express';
import { clientService } from '../services/client.service';
import { apiResponse } from '../utils/response';

export const clientController = {
  async listClients(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await clientService.listClients({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        search: req.query.search as string,
        status: req.query.status as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      });
      return apiResponse.paginated(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getClient(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.getClientById(req.params.id);
      return apiResponse.success(res, client);
    } catch (error) {
      next(error);
    }
  },

  async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.createClient(req.body, req.user?.userId);
      return apiResponse.created(res, client, 'Client created successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.updateClient(req.params.id, req.body, req.user?.userId);
      return apiResponse.success(res, client, 'Client updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async archiveClient(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await clientService.archiveClient(req.params.id, req.user?.userId);
      return apiResponse.success(res, client, 'Client archived successfully');
    } catch (error) {
      next(error);
    }
  },

  async addContact(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await clientService.addContact(req.params.id, req.body, req.user?.userId);
      return apiResponse.created(res, contact, 'Contact added successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteContact(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await clientService.deleteContact(req.params.id, req.params.contactId, req.user?.userId);
      return apiResponse.success(res, result, 'Contact deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};
