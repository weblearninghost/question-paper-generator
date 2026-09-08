import { Module } from '@nestjs/common';
import { QuestionPaperService } from './question-paper.service';
import { QuestionPaperController } from './question-paper.controller';

@Module({
  providers: [QuestionPaperService],
  controllers: [QuestionPaperController],
})
export class QuestionPaperModule {}
