import { Controller, Get } from '@nestjs/common';

import { ClassService } from './class.service';

@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get()
  async getClasses() {
    return this.classService.getClasses();
  }
}
