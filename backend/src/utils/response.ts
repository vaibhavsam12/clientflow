import { Response } from 'express';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const apiResponse = {
  success<T>(res: Response, data: T, message?: string, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },

  created<T>(res: Response, data: T, message = 'Resource created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  },

  paginated<T>(res: Response, result: PaginatedResult<T>, message?: string, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      ...result
    });
  },

  noContent(res: Response) {
    return res.status(204).send();
  },

  error(res: Response, message: string, statusCode = 500, details?: any) {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        statusCode,
        details
      }
    });
  }
};
