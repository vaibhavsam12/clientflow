import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';

export interface StorageUploadResult {
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  storagePath: string;
}

export interface IStorageService {
  saveFile(file: Express.Multer.File): Promise<StorageUploadResult>;
  getFilePath(storagePath: string): string;
  deleteFile(storagePath: string): Promise<void>;
}

export class LocalStorageService implements IStorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(config.uploadDir);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File): Promise<StorageUploadResult> {
    if (!file) {
      throw new BadRequestError('No file provided for upload.');
    }

    if (file.size > config.maxFileSize) {
      throw new BadRequestError(`File size exceeds maximum limit of ${config.maxFileSize / (1024 * 1024)}MB.`);
    }

    if (!config.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestError(`File type "${file.mimetype}" is not allowed.`);
    }

    const fileExt = path.extname(file.originalname);
    const storageKey = `${uuidv4()}${fileExt}`;
    const targetPath = path.join(this.uploadDir, storageKey);

    // Write file to storage
    await fs.promises.writeFile(targetPath, file.buffer);

    return {
      fileName: file.originalname,
      originalName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      storageKey,
      storagePath: targetPath
    };
  }

  getFilePath(storagePath: string): string {
    if (!fs.existsSync(storagePath)) {
      throw new NotFoundError('Physical file not found on disk.');
    }
    return storagePath;
  }

  async deleteFile(storagePath: string): Promise<void> {
    try {
      if (fs.existsSync(storagePath)) {
        await fs.promises.unlink(storagePath);
      }
    } catch (error) {
      // Log error but avoid crashing if file was already deleted
      console.error(`Failed to delete local file at ${storagePath}`, error);
    }
  }
}

export const storageService = new LocalStorageService();
