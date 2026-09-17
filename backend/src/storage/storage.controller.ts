import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';

import type { Response } from 'express';

import { StorageService } from './storage.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('*path')
  @UseGuards(JwtAuthGuard)
  async getFile(
    @Param('path') storagePath: string | string[],
    @Res() res: Response,
  ) {
    const storageKey = Array.isArray(storagePath)
      ? storagePath.join('/')
      : storagePath;

    const filePath = await this.storageService.getFilePath(storageKey);

    return res.sendFile(filePath);
  }
}
