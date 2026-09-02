import { prisma } from '../prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { PaginatedResult } from '../utils/response';
import { activityService } from './activity.service';
import { notificationService } from './notification.service';

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string | null;
  priority?: string;
  status?: string;
  dueDate?: string | null;
  estimatedHours?: number | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  projectId?: string;
  assigneeId?: string | null;
  priority?: string;
  status?: string;
  dueDate?: string | null;
  estimatedHours?: number | null;
}

export class TaskService {
  async listTasks(params: {
    page?: number;
    limit?: number;
    search?: string;
    projectId?: string;
    assigneeId?: string;
    status?: string;
    priority?: string;
    overdue?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResult<any>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.projectId) where.projectId = params.projectId;
    if (params.assigneeId) where.assigneeId = params.assigneeId;
    if (params.status) where.status = params.status;
    if (params.priority) where.priority = params.priority;

    if (params.overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'DONE' };
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search } },
        { description: { contains: params.search } }
      ];
    }

    const orderBy: any = {};
    const sortField = params.sortBy || 'createdAt';
    const sortDir = params.sortOrder || 'desc';
    orderBy[sortField] = sortDir;

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          project: {
            select: { id: true, name: true, clientId: true, client: { select: { id: true, name: true } } }
          },
          assignee: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          },
          creator: {
            select: { id: true, name: true }
          }
        }
      })
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: tasks,
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

  async getTaskById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            client: { select: { id: true, name: true, company: true } }
          }
        },
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        activities: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            actor: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!task) {
      throw new NotFoundError('Task not found.');
    }

    return task;
  }

  async createTask(data: CreateTaskInput, creatorId: string) {
    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) {
      throw new BadRequestError('Referenced project does not exist.');
    }

    if (data.assigneeId) {
      const assignee = await prisma.user.findUnique({ where: { id: data.assigneeId } });
      if (!assignee) {
        throw new BadRequestError('Referenced assignee does not exist.');
      }
    }

    const task = await prisma.task.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        projectId: data.projectId,
        assigneeId: data.assigneeId || null,
        creatorId,
        priority: data.priority || 'MEDIUM',
        status: data.status || 'TODO',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimatedHours: data.estimatedHours || null
      },
      include: {
        project: { select: { id: true, name: true, clientId: true } },
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } }
      }
    });

    // Notify assignee if assigned to someone else
    if (task.assigneeId && task.assigneeId !== creatorId) {
      await notificationService.createNotification({
        userId: task.assigneeId,
        title: 'New Task Assigned',
        message: `You were assigned task "${task.title}" in project "${project.name}"`,
        type: 'TASK_ASSIGNED',
        link: `/tasks?selected=${task.id}`
      });
    }

    await activityService.log({
      actorId: creatorId,
      action: 'TASK_CREATED',
      entityType: 'TASK',
      entityId: task.id,
      projectId: project.id,
      clientId: project.clientId,
      taskId: task.id,
      metadata: { title: task.title, status: task.status, priority: task.priority }
    });

    return task;
  }

  async updateTask(id: string, data: UpdateTaskInput, actorId?: string) {
    const existing = await prisma.task.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!existing) {
      throw new NotFoundError('Task not found.');
    }

    const completedAt = data.status === 'DONE' && existing.status !== 'DONE'
      ? new Date()
      : (data.status && data.status !== 'DONE' ? null : undefined);

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        description: data.description !== undefined ? data.description : undefined,
        projectId: data.projectId !== undefined ? data.projectId : undefined,
        assigneeId: data.assigneeId !== undefined ? data.assigneeId : undefined,
        priority: data.priority !== undefined ? data.priority : undefined,
        status: data.status !== undefined ? data.status : undefined,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
        estimatedHours: data.estimatedHours !== undefined ? data.estimatedHours : undefined,
        completedAt
      },
      include: {
        project: { select: { id: true, name: true, clientId: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    // If assignee changed, notify new assignee
    if (data.assigneeId && data.assigneeId !== existing.assigneeId && data.assigneeId !== actorId) {
      await notificationService.createNotification({
        userId: data.assigneeId,
        title: 'Task Assigned',
        message: `Task "${updated.title}" was assigned to you`,
        type: 'TASK_ASSIGNED',
        link: `/tasks?selected=${updated.id}`
      });
    }

    // If status changed to DONE or BLOCKED, notify creator if different from actor
    if (data.status && data.status !== existing.status && existing.creatorId !== actorId) {
      await notificationService.createNotification({
        userId: existing.creatorId,
        title: 'Task Status Updated',
        message: `Task "${updated.title}" status changed to ${data.status}`,
        type: 'STATUS_CHANGE',
        link: `/tasks?selected=${updated.id}`
      });
    }

    await activityService.log({
      actorId,
      action: data.status && data.status !== existing.status ? 'TASK_STATUS_CHANGED' : 'TASK_UPDATED',
      entityType: 'TASK',
      entityId: id,
      projectId: updated.projectId,
      clientId: updated.project?.clientId,
      taskId: id,
      metadata: {
        previousStatus: existing.status,
        newStatus: updated.status,
        changes: data
      }
    });

    return updated;
  }

  async updateTaskStatus(id: string, status: string, actorId?: string) {
    return this.updateTask(id, { status }, actorId);
  }

  async deleteTask(id: string, actorId?: string) {
    const existing = await prisma.task.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!existing) {
      throw new NotFoundError('Task not found.');
    }

    await prisma.task.delete({ where: { id } });

    await activityService.log({
      actorId,
      action: 'TASK_DELETED',
      entityType: 'TASK',
      entityId: id,
      projectId: existing.projectId,
      clientId: existing.project?.clientId,
      metadata: { title: existing.title }
    });

    return { success: true };
  }
}

export const taskService = new TaskService();
