import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { QuestionPaperService } from './question-paper.service';
import { GenerateQuestionPaperDto } from './dto/generate-question-paper.dto';

@Controller('question-papers')
export class QuestionPaperController {
  constructor(private readonly questionPaperService: QuestionPaperService) {}

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
}
