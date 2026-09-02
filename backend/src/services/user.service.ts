import { prisma } from '../prisma';
import { hashPassword, comparePassword } from '../utils/passwords';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';
import { PaginatedResult } from '../utils/response';
import { activityService } from './activity.service';

export class UserService {
  async listUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResult<any>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } }
      ];
    }
    if (params.role) {
      where.role = params.role;
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              assignedTasks: true,
              projectMemberships: true
            }
          }
        }
      })
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        projectMemberships: {
          include: {
            project: {
              select: { id: true, name: true, status: true }
            }
          }
        },
        _count: {
          select: {
            assignedTasks: true,
            uploadedDocuments: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    return user;
  }

  async createUser(data: { name: string; email: string; password: string; role?: string; avatarUrl?: string }, actorId?: string) {
    const normalizedEmail = data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      throw new ConflictError('A user with this email address already exists.');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: data.role || 'MEMBER',
        avatarUrl: data.avatarUrl || null,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true
      }
    });

    await activityService.log({
      actorId,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: user.id,
      metadata: { role: user.role, name: user.name }
    });

    return user;
  }

  async updateUser(id: string, data: { name?: string; email?: string; role?: string; avatarUrl?: string; isActive?: boolean }, actorId?: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    if (data.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase().trim() }
      });
      if (existing) {
        throw new ConflictError('Email address is already in use by another account.');
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : undefined,
        email: data.email ? data.email.toLowerCase().trim() : undefined,
        role: data.role,
        avatarUrl: data.avatarUrl,
        isActive: data.isActive
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        updatedAt: true
      }
    });

    await activityService.log({
      actorId,
      action: 'USER_UPDATED',
      entityType: 'USER',
      entityId: id,
      metadata: data
    });

    return updated;
  }
}

export const userService = new UserService();
