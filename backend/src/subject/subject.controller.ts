import { Controller, Get, Param } from '@nestjs/common';

import { SubjectService } from './subject.service';

@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get('class/:classId')
  async getSubjectsByClass(@Param('classId') classId: string) {
    return this.subjectService.getSubjectsByClass(classId);
  }
}
