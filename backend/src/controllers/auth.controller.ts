import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { apiResponse } from '../utils/response';
import { config } from '../config';

const REFRESH_COOKIE_NAME = 'clientflow_refresh_token';

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    maxAge: config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000
  });
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      setRefreshCookie(res, result.refreshToken);
      return apiResponse.created(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }, 'Registration successful');
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      setRefreshCookie(res, result.refreshToken);
      return apiResponse.success(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body.refreshToken;
      const result = await authService.refresh(refreshToken);
      setRefreshCookie(res, result.refreshToken);
      return apiResponse.success(res, {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body.refreshToken;
      await authService.logout(refreshToken);
      res.clearCookie(REFRESH_COOKIE_NAME);
      return apiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrentUser(req.user!.userId);
      return apiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  }
};
