import { prisma } from '../prisma';
import { hashPassword, comparePassword } from '../utils/passwords';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';
import { activityService } from './activity.service';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'MANAGER' | 'MEMBER';
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterInput) {
    const normalizedEmail = data.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      throw new ConflictError('An account with this email address already exists.');
    }

    // Check if this is the first user registered in system -> make them ADMIN
    const totalUsers = await prisma.user.count();
    const role = totalUsers === 0 ? 'ADMIN' : (data.role || 'MEMBER');

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const refreshTokenRecord = await prisma.refreshToken.create({
      data: {
        token: uuidv4(),
        userId: user.id,
        expiresAt: new Date(Date.now() + config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000)
      }
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      tokenId: refreshTokenRecord.id
    });

    await activityService.log({
      actorId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: user.id,
      metadata: { role: user.role }
    });

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  async login(data: LoginInput) {
    const normalizedEmail = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password credentials.');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Please contact an administrator.');
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password credentials.');
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const refreshTokenRecord = await prisma.refreshToken.create({
      data: {
        token: uuidv4(),
        userId: user.id,
        expiresAt: new Date(Date.now() + config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000)
      }
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      tokenId: refreshTokenRecord.id
    });

    await activityService.log({
      actorId: user.id,
      action: 'USER_LOGGED_IN',
      entityType: 'USER',
      entityId: user.id
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    };

    return {
      user: safeUser,
      accessToken,
      refreshToken
    };
  }

  async refresh(refreshTokenRaw: string) {
    if (!refreshTokenRaw) {
      throw new UnauthorizedError('Refresh token required.');
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenRaw);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
      include: { user: true }
    });

    if (!tokenRecord || tokenRecord.revokedAt || new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedError('Refresh token expired or revoked. Please login again.');
    }

    const user = tokenRecord.user;
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account not found or deactivated.');
    }

    // Revoke old refresh token (rotation)
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() }
    });

    // Create new refresh token
    const newRecord = await prisma.refreshToken.create({
      data: {
        token: uuidv4(),
        userId: user.id,
        expiresAt: new Date(Date.now() + config.jwt.refreshExpiresInDays * 24 * 60 * 60 * 1000)
      }
    });

    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      tokenId: newRecord.id
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    };

    return {
      user: safeUser,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  async logout(refreshTokenRaw?: string) {
    if (refreshTokenRaw) {
      try {
        const payload = verifyRefreshToken(refreshTokenRaw);
        await prisma.refreshToken.updateMany({
          where: { id: payload.tokenId },
          data: { revokedAt: new Date() }
        });
      } catch {
        // Safe ignore
      }
    }
    return { success: true };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    return user;
  }
}

export const authService = new AuthService();
