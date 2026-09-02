import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { apiResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err.stack);

  // Handle custom AppError instances
  if (err instanceof AppError) {
    return apiResponse.error(res, err.message, err.statusCode, err.details);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return apiResponse.error(res, 'Validation failed', 422, formattedErrors);
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return apiResponse.error(res, `A record with this ${target} already exists.`, 409);
    }
    if (err.code === 'P2025') {
      return apiResponse.error(res, 'Requested resource was not found.', 404);
    }
    if (err.code === 'P2003') {
      return apiResponse.error(res, 'Foreign key constraint violated.', 400);
    }
  }

  // Fallback for unhandled unexpected errors
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected internal error occurred' 
    : err.message || 'Internal Server Error';

  return apiResponse.error(res, message, 500);
};
