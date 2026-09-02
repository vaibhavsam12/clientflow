import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { apiResponse } from '../utils/response';

export const notificationController = {
  async listNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.getNotifications(req.user!.userId, {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        isRead: req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined
      });
      return apiResponse.paginated(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.user!.userId);
      return apiResponse.success(res, { unreadCount: count });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user!.userId);
      return apiResponse.success(res, notification, 'Marked as read');
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      return apiResponse.success(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
};
