import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  Param,
  Res,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Response } from 'express';

import { QuestionPaperService } from './question-paper.service';
import { GenerateQuestionPaperDto } from './dto/generate-question-paper.dto';
import { PdfService } from '../pdf/pdf.service';

@Controller('question-papers')
export class QuestionPaperController {
  constructor(
    private readonly questionPaperService: QuestionPaperService,
    private readonly pdfService: PdfService,
  ) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateQuestionPaper(
    @Req() req: any,
    @Body() dto: GenerateQuestionPaperDto,
  ) {
    return this.questionPaperService.generateQuestionPaper(req.user.id, dto);
  }

  @Get(':paperId')
  @UseGuards(JwtAuthGuard)
  async getQuestionPaper(@Param('paperId') paperId: string) {
    return this.questionPaperService.getQuestionPaper(paperId);
  }

  @Get(':paperId/answer-sheet')
  @UseGuards(JwtAuthGuard)
  async getAnswerSheet(@Param('paperId') paperId: string) {
    return this.questionPaperService.getAnswerSheet(paperId);
  }

  @Get(':paperId/pdf')
  @UseGuards(JwtAuthGuard)
  async generatePdf(@Param('paperId') paperId: string, @Res() res: Response) {
    const paper = await this.questionPaperService.getQuestionPaper(paperId);

    const pdf = this.pdfService.generateQuestionPaper(paper);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="question-paper-${paperId}.pdf"`,
    });

    pdf.pipe(res);
    pdf.end();
  }
}
