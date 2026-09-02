import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { QuestionBankService } from './question-bank.service';

@Controller('question-bank')
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post('preview-excel')
  @UseInterceptors(FileInterceptor('file'))
  async previewExcel(@UploadedFile() file: Express.Multer.File) {
    return this.questionBankService.previewExcel(file);
  }
}
