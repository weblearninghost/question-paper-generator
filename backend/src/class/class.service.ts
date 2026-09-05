import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassService {
  constructor(private readonly prisma: PrismaService) {}

  async getClasses() {
    return this.prisma.class.findMany({
      orderBy: {
        classNo: 'asc',
      },
      select: {
        id: true,
        name: true,
        classNo: true,
      },
    });
  }
}
