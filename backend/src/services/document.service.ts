import { prisma } from '../prisma';
import { storageService } from './storage.service';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { PaginatedResult } from '../utils/response';
import { activityService } from './activity.service';

export interface UploadDocumentParams {
  file: Express.Multer.File;
  clientId?: string;
  projectId?: string;
  uploadedById: string;
}

export class DocumentService {
  async uploadDocument(params: UploadDocumentParams) {
    if (!params.file) {
      throw new BadRequestError('No file uploaded.');
    }

    if (params.clientId) {
      const client = await prisma.client.findUnique({ where: { id: params.clientId } });
      if (!client) throw new BadRequestError('Referenced client does not exist.');
    }

    if (params.projectId) {
      const project = await prisma.project.findUnique({ where: { id: params.projectId } });
      if (!project) throw new BadRequestError('Referenced project does not exist.');
    }

    // Save physical file
    const uploadResult = await storageService.saveFile(params.file);

    // Save document metadata in database
    const document = await prisma.document.create({
      data: {
        fileName: uploadResult.fileName,
        originalName: uploadResult.originalName,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
        storageKey: uploadResult.storageKey,
        storagePath: uploadResult.storagePath,
        clientId: params.clientId || null,
        projectId: params.projectId || null,
        uploadedById: params.uploadedById
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true }
        },
        client: {
          select: { id: true, name: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    await activityService.log({
      actorId: params.uploadedById,
      action: 'DOCUMENT_UPLOADED',
      entityType: 'DOCUMENT',
      entityId: document.id,
      clientId: document.clientId,
      projectId: document.projectId,
      metadata: {
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType
      }
    });

    return document;
  }

  async listDocuments(params: {
    page?: number;
    limit?: number;
    clientId?: string;
    projectId?: string;
    search?: string;
  }): Promise<PaginatedResult<any>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 15));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.clientId) where.clientId = params.clientId;
    if (params.projectId) where.projectId = params.projectId;
    if (params.search) {
      where.fileName = { contains: params.search };
    }

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true, avatarUrl: true }
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

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: documents,
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

  async getDocumentById(id: string) {
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      }
    });

    if (!document) {
      throw new NotFoundError('Document not found.');
    }

    return document;
  }

  async getDownloadPath(id: string): Promise<{ path: string; document: any }> {
    const document = await this.getDocumentById(id);
    const filePath = storageService.getFilePath(document.storagePath);
    return { path: filePath, document };
  }

  async deleteDocument(id: string, actorId?: string) {
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundError('Document not found.');
    }

    // Delete physical file
    await storageService.deleteFile(document.storagePath);

    // Delete database record
    await prisma.document.delete({ where: { id } });

    await activityService.log({
      actorId,
      action: 'DOCUMENT_DELETED',
      entityType: 'DOCUMENT',
      entityId: id,
      clientId: document.clientId,
      projectId: document.projectId,
      metadata: { fileName: document.fileName }
    });

    return { success: true };
  }
}

export const documentService = new DocumentService();
