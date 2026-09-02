import { Module } from '@nestjs/common';
import { QuestionBankController } from './question-bank.controller';
import { QuestionBankService } from './question-bank.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [QuestionBankController],
  providers: [QuestionBankService, PrismaService],
})
export class QuestionBankModule {}
