import { prisma } from '../prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { PaginatedResult } from '../utils/response';
import { activityService } from './activity.service';

export interface CreateClientInput {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  status?: string;
  notes?: string;
}

export interface UpdateClientInput {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  status?: string;
  notes?: string;
}

export interface CreateContactInput {
  name: string;
  email: string;
  phone?: string;
  title?: string;
  isPrimary?: boolean;
}

export class ClientService {
  async listClients(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResult<any>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { company: { contains: params.search } },
        { email: { contains: params.search } }
      ];
    }

    const orderBy: any = {};
    const sortField = params.sortBy || 'createdAt';
    const sortDir = params.sortOrder || 'desc';
    orderBy[sortField] = sortDir;

    const [total, clients] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          contacts: {
            where: { isPrimary: true },
            take: 1
          },
          _count: {
            select: {
              projects: true,
              contacts: true,
              documents: true
            }
          }
        }
      })
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: clients,
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

  async getClientById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        contacts: {
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }]
        },
        projects: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                tasks: true,
                members: true
              }
            }
          }
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            uploadedBy: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: {
            projects: true,
            contacts: true,
            documents: true
          }
        }
      }
    });

    if (!client) {
      throw new NotFoundError('Client not found.');
    }

    return client;
  }

  async createClient(data: CreateClientInput, actorId?: string) {
    const client = await prisma.client.create({
      data: {
        name: data.name.trim(),
        company: data.company?.trim() || null,
        email: data.email?.toLowerCase().trim() || null,
        phone: data.phone?.trim() || null,
        website: data.website?.trim() || null,
        address: data.address?.trim() || null,
        status: data.status || 'ACTIVE',
        notes: data.notes?.trim() || null
      }
    });

    await activityService.log({
      actorId,
      action: 'CLIENT_CREATED',
      entityType: 'CLIENT',
      entityId: client.id,
      clientId: client.id,
      metadata: { name: client.name, status: client.status }
    });

    return client;
  }

  async updateClient(id: string, data: UpdateClientInput, actorId?: string) {
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Client not found.');
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        company: data.company !== undefined ? (data.company.trim() || null) : undefined,
        email: data.email !== undefined ? (data.email.toLowerCase().trim() || null) : undefined,
        phone: data.phone !== undefined ? (data.phone.trim() || null) : undefined,
        website: data.website !== undefined ? (data.website.trim() || null) : undefined,
        address: data.address !== undefined ? (data.address.trim() || null) : undefined,
        status: data.status !== undefined ? data.status : undefined,
        notes: data.notes !== undefined ? (data.notes.trim() || null) : undefined
      }
    });

    await activityService.log({
      actorId,
      action: 'CLIENT_UPDATED',
      entityType: 'CLIENT',
      entityId: id,
      clientId: id,
      metadata: {
        previousStatus: existing.status,
        newStatus: updated.status,
        changes: data
      }
    });

    return updated;
  }

  async archiveClient(id: string, actorId?: string) {
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Client not found.');
    }

    const updated = await prisma.client.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });

    await activityService.log({
      actorId,
      action: 'CLIENT_ARCHIVED',
      entityType: 'CLIENT',
      entityId: id,
      clientId: id
    });

    return updated;
  }

  async addContact(clientId: string, data: CreateContactInput, actorId?: string) {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      throw new NotFoundError('Client not found.');
    }

    if (data.isPrimary) {
      // Unset existing primary contact
      await prisma.clientContact.updateMany({
        where: { clientId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    const contact = await prisma.clientContact.create({
      data: {
        clientId,
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim() || null,
        title: data.title?.trim() || null,
        isPrimary: data.isPrimary || false
      }
    });

    await activityService.log({
      actorId,
      action: 'CLIENT_CONTACT_ADDED',
      entityType: 'CLIENT',
      entityId: clientId,
      clientId,
      metadata: { contactName: contact.name, contactEmail: contact.email }
    });

    return contact;
  }

  async deleteContact(clientId: string, contactId: string, actorId?: string) {
    const contact = await prisma.clientContact.findFirst({
      where: { id: contactId, clientId }
    });

    if (!contact) {
      throw new NotFoundError('Client contact not found.');
    }

    await prisma.clientContact.delete({
      where: { id: contactId }
    });

    await activityService.log({
      actorId,
      action: 'CLIENT_CONTACT_DELETED',
      entityType: 'CLIENT',
      entityId: clientId,
      clientId,
      metadata: { contactName: contact.name }
    });

    return { success: true };
  }
}

export const clientService = new ClientService();
