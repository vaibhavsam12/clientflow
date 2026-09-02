import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { apiResponse } from '../utils/response';

export const dashboardController = {
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getStats();
      return apiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  },

  async getCharts(_req: Request, res: Response, next: NextFunction) {
    try {
      const charts = await dashboardService.getChartsData();
      return apiResponse.success(res, charts);
    } catch (error) {
      next(error);
    }
  },

  async getWorkload(_req: Request, res: Response, next: NextFunction) {
    try {
      const workload = await dashboardService.getTeamWorkload();
      return apiResponse.success(res, workload);
    } catch (error) {
      next(error);
    }
  },

  async getDeadlines(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
      const deadlines = await dashboardService.getUpcomingDeadlines(limit);
      return apiResponse.success(res, deadlines);
    } catch (error) {
      next(error);
    }
  }
};
