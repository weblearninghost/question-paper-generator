import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QuestionBankModule } from './question-bank/question-bank.module';
import { ClassModule } from './class/class.module';
import { SubjectModule } from './subject/subject.module';
import { ChapterModule } from './chapter/chapter.module';
import { QuestionPaperModule } from './question-paper/question-paper.module';
import { TuitionModule } from './tuition/tuition.module';
import { StorageModule } from './storage/storage.module';
import { PdfModule } from './pdf/pdf.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    QuestionBankModule,
    ClassModule,
    SubjectModule,
    ChapterModule,
    QuestionPaperModule,
    TuitionModule,
    StorageModule,
    PdfModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
