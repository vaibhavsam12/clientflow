import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { apiResponse } from '../utils/response';

export const projectController = {
  async listProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.listProjects({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        search: req.query.search as string,
        clientId: req.query.clientId as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        userId: req.user?.role === 'MEMBER' ? req.user.userId : undefined
      });
      return apiResponse.paginated(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getProjectById(req.params.id);
      return apiResponse.success(res, project);
    } catch (error) {
      next(error);
    }
  },

  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.createProject(req.body, req.user?.userId);
      return apiResponse.created(res, project, 'Project created successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.updateProject(req.params.id, req.body, req.user?.userId);
      return apiResponse.success(res, project, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async archiveProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.archiveProject(req.params.id, req.user?.userId);
      return apiResponse.success(res, project, 'Project archived successfully');
    } catch (error) {
      next(error);
    }
  },

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await projectService.addMember(
        req.params.id,
        req.body.userId,
        req.body.role,
        req.user?.userId
      );
      return apiResponse.created(res, member, 'Member added to project');
    } catch (error) {
      next(error);
    }
  },

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.removeMember(
        req.params.id,
        req.params.userId,
        req.user?.userId
      );
      return apiResponse.success(res, result, 'Member removed from project');
    } catch (error) {
      next(error);
    }
  }
};
