import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChapterService {
  constructor(private readonly prisma: PrismaService) {}

  async getChaptersBySubject(subjectId: string) {
    return this.prisma.chapter.findMany({
      where: {
        subjectId,
      },
      orderBy: [
        {
          chapterNo: 'asc',
        },
        {
          name: 'asc',
        },
      ],
      select: {
        id: true,
        name: true,
        chapterNo: true,
        subjectId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
