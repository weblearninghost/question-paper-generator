import { Module } from '@nestjs/common';
import { QuestionPaperService } from './question-paper.service';
import { QuestionPaperController } from './question-paper.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [PrismaModule, PdfModule],
  providers: [QuestionPaperService],
  controllers: [QuestionPaperController],
})
export class QuestionPaperModule {}
