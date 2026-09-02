import { prisma } from '../prisma';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';
import { PaginatedResult } from '../utils/response';
import { activityService } from './activity.service';
import { notificationService } from './notification.service';

export interface CreateProjectInput {
  name: string;
  description?: string;
  clientId: string;
  status?: string;
  priority?: string;
  startDate?: string | null;
  targetEndDate?: string | null;
  budget?: number | null;
  memberIds?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  clientId?: string;
  status?: string;
  priority?: string;
  startDate?: string | null;
  targetEndDate?: string | null;
  actualEndDate?: string | null;
  budget?: number | null;
}

export class ProjectService {
  async listProjects(params: {
    page?: number;
    limit?: number;
    search?: string;
    clientId?: string;
    status?: string;
    priority?: string;
    userId?: string; // If member role filtering
  }): Promise<PaginatedResult<any>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.clientId) where.clientId = params.clientId;
    if (params.status) where.status = params.status;
    if (params.priority) where.priority = params.priority;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { description: { contains: params.search } }
      ];
    }

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: { id: true, name: true, company: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true, avatarUrl: true }
              }
            }
          },
          tasks: {
            select: { id: true, status: true }
          },
          _count: {
            select: {
              tasks: true,
              documents: true,
              members: true
            }
          }
        }
      })
    ]);

    // Calculate dynamic task completion progress for each project
    const projectsWithProgress = projects.map(proj => {
      const totalTasks = proj.tasks.length;
      const completedTasks = proj.tasks.filter(t => t.status === 'DONE').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const { tasks, ...rest } = proj;
      return {
        ...rest,
        stats: {
          totalTasks,
          completedTasks,
          progress
        }
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: projectsWithProgress,
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

  async getProjectById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, name: true, company: true, email: true, phone: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatarUrl: true }
            }
          }
        },
        tasks: {
          orderBy: [{ status: 'asc' }, { priority: 'desc' }],
          include: {
            assignee: {
              select: { id: true, name: true, avatarUrl: true }
            }
          }
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploadedBy: {
              select: { id: true, name: true }
            }
          }
        },
        _count: {
          select: {
            tasks: true,
            documents: true,
            members: true
          }
        }
      }
    });

    if (!project) {
      throw new NotFoundError('Project not found.');
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === 'DONE').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...project,
      stats: {
        totalTasks,
        completedTasks,
        progress
      }
    };
  }

  async createProject(data: CreateProjectInput, actorId?: string) {
    const client = await prisma.client.findUnique({ where: { id: data.clientId } });
    if (!client) {
      throw new BadRequestError('Referenced client does not exist.');
    }

    const project = await prisma.project.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        clientId: data.clientId,
        status: data.status || 'PLANNING',
        priority: data.priority || 'MEDIUM',
        startDate: data.startDate ? new Date(data.startDate) : null,
        targetEndDate: data.targetEndDate ? new Date(data.targetEndDate) : null,
        budget: data.budget !== undefined ? data.budget : null
      }
    });

    // Add creator or specified members
    if (actorId) {
      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId: actorId,
          role: 'LEAD'
        }
      });
    }

    if (data.memberIds && data.memberIds.length > 0) {
      for (const userId of data.memberIds) {
        if (userId !== actorId) {
          await prisma.projectMember.create({
            data: {
              projectId: project.id,
              userId,
              role: 'CONTRIBUTOR'
            }
          });

          await notificationService.createNotification({
            userId,
            title: 'Added to Project',
            message: `You were added to project "${project.name}"`,
            type: 'PROJECT_UPDATED',
            link: `/projects/${project.id}`
          });
        }
      }
    }

    await activityService.log({
      actorId,
      action: 'PROJECT_CREATED',
      entityType: 'PROJECT',
      entityId: project.id,
      clientId: project.clientId,
      projectId: project.id,
      metadata: { name: project.name, status: project.status }
    });

    return this.getProjectById(project.id);
  }

  async updateProject(id: string, data: UpdateProjectInput, actorId?: string) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Project not found.');
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        description: data.description !== undefined ? data.description : undefined,
        clientId: data.clientId !== undefined ? data.clientId : undefined,
        status: data.status !== undefined ? data.status : undefined,
        priority: data.priority !== undefined ? data.priority : undefined,
        startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
        targetEndDate: data.targetEndDate !== undefined ? (data.targetEndDate ? new Date(data.targetEndDate) : null) : undefined,
        actualEndDate: data.actualEndDate !== undefined ? (data.actualEndDate ? new Date(data.actualEndDate) : null) : undefined,
        budget: data.budget !== undefined ? data.budget : undefined
      }
    });

    await activityService.log({
      actorId,
      action: 'PROJECT_UPDATED',
      entityType: 'PROJECT',
      entityId: id,
      clientId: updated.clientId,
      projectId: id,
      metadata: {
        previousStatus: existing.status,
        newStatus: updated.status,
        changes: data
      }
    });

    return this.getProjectById(id);
  }

  async archiveProject(id: string, actorId?: string) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Project not found.');
    }

    const updated = await prisma.project.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });

    await activityService.log({
      actorId,
      action: 'PROJECT_ARCHIVED',
      entityType: 'PROJECT',
      entityId: id,
      clientId: existing.clientId,
      projectId: id
    });

    return updated;
  }

  async addMember(projectId: string, userId: string, role = 'CONTRIBUTOR', actorId?: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError('Project not found.');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found.');

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });

    if (existing) {
      throw new ConflictError('User is already a member of this project.');
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    await notificationService.createNotification({
      userId,
      title: 'Added to Project',
      message: `You were assigned as ${role} in "${project.name}"`,
      type: 'PROJECT_UPDATED',
      link: `/projects/${projectId}`
    });

    await activityService.log({
      actorId,
      action: 'PROJECT_MEMBER_ADDED',
      entityType: 'PROJECT',
      entityId: projectId,
      projectId,
      metadata: { memberName: user.name, role }
    });

    return member;
  }

  async removeMember(projectId: string, userId: string, actorId?: string) {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
      include: { user: true }
    });

    if (!member) {
      throw new NotFoundError('Project membership not found.');
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } }
    });

    await activityService.log({
      actorId,
      action: 'PROJECT_MEMBER_REMOVED',
      entityType: 'PROJECT',
      entityId: projectId,
      projectId,
      metadata: { memberName: member.user.name }
    });

    return { success: true };
  }
}

export const projectService = new ProjectService();
