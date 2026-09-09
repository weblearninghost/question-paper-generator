import { Injectable, InternalServerErrorException } from '@nestjs/common';

import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly uploadDirectory = path.join(process.cwd(), 'uploads');

  async saveFile(file: Express.Multer.File, folder: string, prefix: string) {
    const folderPath = path.join(this.uploadDirectory, folder);

    await fs.mkdir(folderPath, {
      recursive: true,
    });

    const extension = path.extname(file.originalname);

    const fileName = `${prefix}-${randomUUID()}${extension}`;

    const storageKey = path.join(folder, fileName);

    const filePath = path.join(this.uploadDirectory, storageKey);

    try {
      await fs.writeFile(filePath, file.buffer);
    } catch {
      throw new InternalServerErrorException('Failed to save file');
    }

    return {
      storageKey,
      fileName: file.originalname,
      mimeType: file.mimetype,
      filePath,
    };
  }

  async deleteFile(storageKey: string) {
    if (!storageKey) {
      return;
    }

    const filePath = path.join(this.uploadDirectory, storageKey);

    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      // File may already have been deleted.
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
