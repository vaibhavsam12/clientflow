import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { apiResponse } from '../utils/response';

export const taskController = {
  async listTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.listTasks({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        search: req.query.search as string,
        projectId: req.query.projectId as string,
        assigneeId: req.query.assigneeId as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        overdue: req.query.overdue === 'true',
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      });
      return apiResponse.paginated(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getTaskById(req.params.id);
      return apiResponse.success(res, task);
    } catch (error) {
      next(error);
    }
  },

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.createTask(req.body, req.user!.userId);
      return apiResponse.created(res, task, 'Task created successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.updateTask(req.params.id, req.body, req.user?.userId);
      return apiResponse.success(res, task, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.updateTaskStatus(req.params.id, req.body.status, req.user?.userId);
      return apiResponse.success(res, task, 'Task status updated');
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.deleteTask(req.params.id, req.user?.userId);
      return apiResponse.success(res, result, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};
