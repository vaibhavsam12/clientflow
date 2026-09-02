export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    assignedTasks?: number;
    projectMemberships?: number;
    uploadedDocuments?: number;
  };
}

export type ClientStatus = 'LEAD' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

export interface ClientContact {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone?: string | null;
  title?: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Client {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  status: ClientStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  contacts?: ClientContact[];
  projects?: Project[];
  documents?: Document[];
  _count?: {
    projects: number;
    contacts: number;
    documents: number;
  };
}

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user: User;
  role: 'LEAD' | 'CONTRIBUTOR' | 'OBSERVER';
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  clientId: string;
  client?: Client;
  status: ProjectStatus;
  priority: Priority;
  startDate?: string | null;
  targetEndDate?: string | null;
  actualEndDate?: string | null;
  budget?: number | null;
  createdAt: string;
  updatedAt: string;
  members?: ProjectMember[];
  tasks?: Task[];
  documents?: Document[];
  stats?: {
    totalTasks: number;
    completedTasks: number;
    progress: number;
  };
  _count?: {
    tasks: number;
    documents: number;
    members: number;
  };
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'IN_REVIEW' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  projectId: string;
  project?: {
    id: string;
    name: string;
    clientId?: string;
    client?: { id: string; name: string; company?: string | null };
  };
  assigneeId?: string | null;
  assignee?: User | null;
  creatorId: string;
  creator?: { id: string; name: string; email?: string };
  priority: Priority;
  status: TaskStatus;
  dueDate?: string | null;
  completedAt?: string | null;
  estimatedHours?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  storagePath: string;
  clientId?: string | null;
  client?: { id: string; name: string } | null;
  projectId?: string | null;
  project?: { id: string; name: string } | null;
  uploadedById: string;
  uploadedBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  actorId?: string | null;
  actor?: User | null;
  action: string;
  entityType: 'CLIENT' | 'PROJECT' | 'TASK' | 'DOCUMENT' | 'USER';
  entityId: string;
  clientId?: string | null;
  client?: { id: string; name: string } | null;
  projectId?: string | null;
  project?: { id: string; name: string } | null;
  taskId?: string | null;
  task?: { id: string; title: string } | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface DashboardStats {
  clients: {
    total: number;
    active: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    averageProgress: number;
  };
  tasks: {
    total: number;
    open: number;
    completed: number;
    overdue: number;
    completedThisMonth: number;
  };
}

export interface DashboardCharts {
  clientsByStatus: { status: string; count: number }[];
  projectsByStatus: { status: string; count: number }[];
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
}

export interface TeamWorkloadUser {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  totalAssigned: number;
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: number;
}
