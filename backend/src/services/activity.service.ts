import { prisma } from '../prisma';
import { PaginatedResult } from '../utils/response';

export interface CreateActivityInput {
  actorId?: string | null;
  action: string;
  entityType: 'CLIENT' | 'PROJECT' | 'TASK' | 'DOCUMENT' | 'USER';
  entityId: string;
  clientId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  metadata?: Record<string, any>;
}

export class ActivityService {
  async log(data: CreateActivityInput) {
    try {
      return await prisma.activityLog.create({
        data: {
          actorId: data.actorId || null,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          clientId: data.clientId || null,
          projectId: data.projectId || null,
          taskId: data.taskId || null,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null
        }
      });
    } catch (error) {
      console.error('Failed to log activity audit entry:', error);
      return null;
    }
  }

  async getActivities(params: {
    page?: number;
    limit?: number;
    entityType?: string;
    entityId?: string;
    clientId?: string;
    projectId?: string;
  }): Promise<PaginatedResult<any>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 15));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.entityType) where.entityType = params.entityType;
    if (params.entityId) where.entityId = params.entityId;
    if (params.clientId) where.clientId = params.clientId;
    if (params.projectId) where.projectId = params.projectId;

    const [total, activities] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, name: true, email: true, role: true, avatarUrl: true }
          },
          client: {
            select: { id: true, name: true }
          },
          project: {
            select: { id: true, name: true }
          }
        }
      })
    ]);

    const parsedActivities = activities.map(act => ({
      ...act,
      metadata: act.metadata ? JSON.parse(act.metadata) : null
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: parsedActivities,
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
}

export const activityService = new ActivityService();
