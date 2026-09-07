import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaService) {}

  async getSubjectsByClass(classId: string) {
    return this.prisma.subject.findMany({
      where: {
        classId,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        classId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
