import { Request } from 'express';

export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
