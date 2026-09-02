import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { apiResponse } from '../utils/response';

export const userController = {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.listUsers({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        search: req.query.search as string,
        role: req.query.role as string
      });
      return apiResponse.paginated(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
      return apiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  },

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body, req.user?.userId);
      return apiResponse.created(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUser(req.params.id, req.body, req.user?.userId);
      return apiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }
};
