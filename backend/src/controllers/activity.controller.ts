import { Request, Response, NextFunction } from 'express';
import { activityService } from '../services/activity.service';
import { apiResponse } from '../utils/response';

export const activityController = {
  async listActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await activityService.getActivities({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        entityType: req.query.entityType as string,
        entityId: req.query.entityId as string,
        clientId: req.query.clientId as string,
        projectId: req.query.projectId as string
      });
      return apiResponse.paginated(res, result);
    } catch (error) {
      next(error);
    }
  }
};
