import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { QuestionBankService } from './question-bank.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('question-bank')
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post('preview-excel')
  @UseInterceptors(FileInterceptor('file'))
  async previewExcel(@UploadedFile() file: Express.Multer.File) {
    return this.questionBankService.previewExcel(file);
  }

  @Post('import')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Excel file is required');
    }

    return this.questionBankService.importExcel(file);
  }
}
