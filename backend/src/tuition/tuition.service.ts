import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class TuitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async uploadLogo(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Logo image is required');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, PNG and WEBP images are allowed',
      );
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new BadRequestException('Logo size must not exceed 2 MB');
    }

    const tuition = await this.prisma.tuition.findUnique({
      where: {
        ownerId: userId,
      },
    });

    if (!tuition) {
      throw new BadRequestException('Tuition profile not found');
    }

    const uploadedFile = await this.storageService.saveFile(
      file,
      'tuition-logos',
      tuition.id,
    );

    // Delete previous logo after new file
    // has been successfully stored.
    if (tuition.logoStorageKey) {
      await this.storageService.deleteFile(tuition.logoStorageKey);
    }

    const updatedTuition = await this.prisma.tuition.update({
      where: {
        id: tuition.id,
      },
      data: {
        logoStorageKey: uploadedFile.storageKey,

        logoFileName: uploadedFile.fileName,

        logoMimeType: uploadedFile.mimeType,
      },
      select: {
        id: true,
        name: true,
        logoStorageKey: true,
        logoFileName: true,
        logoMimeType: true,
      },
    });

    return {
      message: 'Tuition logo uploaded successfully',
      tuition: updatedTuition,
    };
  }
}
