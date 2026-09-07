import { Controller, Get, Param } from '@nestjs/common';

import { ChapterService } from './chapter.service';

@Controller('chapters')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Get('subject/:subjectId')
  async getChaptersBySubject(@Param('subjectId') subjectId: string) {
    return this.chapterService.getChaptersBySubject(subjectId);
  }
}
