import { prisma } from '../prisma';

export class DashboardService {
  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalClients,
      activeClients,
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      openTasks,
      completedTasks,
      overdueTasks,
      tasksCompletedThisMonth,
      projects
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: 'ACTIVE' } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: { not: 'DONE' } } }),
      prisma.task.count({ where: { status: 'DONE' } }),
      prisma.task.count({
        where: {
          dueDate: { lt: now },
          status: { not: 'DONE' }
        }
      }),
      prisma.task.count({
        where: {
          status: 'DONE',
          completedAt: { gte: startOfMonth }
        }
      }),
      prisma.project.findMany({
        select: {
          id: true,
          tasks: { select: { status: true } }
        }
      })
    ]);

    // Calculate overall average project progress
    let overallProgress = 0;
    if (projects.length > 0) {
      const projectProgresses = projects.map(p => {
        const total = p.tasks.length;
        if (total === 0) return 0;
        const done = p.tasks.filter(t => t.status === 'DONE').length;
        return (done / total) * 100;
      });
      overallProgress = Math.round(projectProgresses.reduce((a, b) => a + b, 0) / projects.length);
    }

    return {
      clients: {
        total: totalClients,
        active: activeClients
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        averageProgress: overallProgress
      },
      tasks: {
        total: totalTasks,
        open: openTasks,
        completed: completedTasks,
        overdue: overdueTasks,
        completedThisMonth: tasksCompletedThisMonth
      }
    };
  }

  async getChartsData() {
    const [
      clientStatusCounts,
      projectStatusCounts,
      taskStatusCounts,
      taskPriorityCounts
    ] = await Promise.all([
      prisma.client.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.project.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.task.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.task.groupBy({
        by: ['priority'],
        _count: { id: true }
      })
    ]);

    return {
      clientsByStatus: clientStatusCounts.map(c => ({ status: c.status, count: c._count.id })),
      projectsByStatus: projectStatusCounts.map(p => ({ status: p.status, count: p._count.id })),
      tasksByStatus: taskStatusCounts.map(t => ({ status: t.status, count: t._count.id })),
      tasksByPriority: taskPriorityCounts.map(t => ({ priority: t.priority, count: t._count.id }))
    };
  }

  async getTeamWorkload() {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        assignedTasks: {
          select: { id: true, status: true, priority: true }
        }
      }
    });

    return users.map(user => {
      const totalAssigned = user.assignedTasks.length;
      const completed = user.assignedTasks.filter(t => t.status === 'DONE').length;
      const inProgress = user.assignedTasks.filter(t => t.status === 'IN_PROGRESS').length;
      const pending = user.assignedTasks.filter(t => t.status === 'TODO' || t.status === 'BLOCKED' || t.status === 'IN_REVIEW').length;
      const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        totalAssigned,
        completed,
        inProgress,
        pending,
        completionRate
      };
    });
  }

  async getUpcomingDeadlines(limit = 6) {
    return prisma.task.findMany({
      where: {
        dueDate: { not: null },
        status: { not: 'DONE' }
      },
      take: limit,
      orderBy: { dueDate: 'asc' },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
  }
}

export const dashboardService = new DashboardService();
