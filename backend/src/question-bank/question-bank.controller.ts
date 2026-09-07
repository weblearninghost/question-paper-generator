import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Get,
  Query,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { QuestionBankService } from './question-bank.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Difficulty, Medium, QuestionType } from '@prisma/client';

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

  @Get('questions')
  @UseGuards(JwtAuthGuard)
  async getQuestions(
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('chapterId') chapterId?: string,
    @Query('medium') medium?: string,
    @Query('type') type?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    return this.questionBankService.getQuestions({
      classId,
      subjectId,
      chapterId,
      medium: medium ? (medium.toUpperCase() as Medium) : undefined,
      type: type ? (type.toUpperCase() as QuestionType) : undefined,
      difficulty: difficulty
        ? (difficulty.toUpperCase() as Difficulty)
        : undefined,
    });
  }
}
