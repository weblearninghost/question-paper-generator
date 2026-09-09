import { BadRequestException, Injectable } from '@nestjs/common';

import { Difficulty, Medium, QuestionType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { GenerateQuestionPaperDto } from './dto/generate-question-paper.dto';

@Injectable()
export class QuestionPaperService {
  constructor(private readonly prisma: PrismaService) {}

  async generateQuestionPaper(userId: string, dto: GenerateQuestionPaperDto) {
    // 1. Validate total marks
    const calculatedTotalMarks = dto.sections.reduce((total, section) => {
      return total + section.count * section.marks;
    }, 0);

    if (calculatedTotalMarks !== dto.totalMarks) {
      throw new BadRequestException(
        `Total marks mismatch. Expected ${calculatedTotalMarks}, received ${dto.totalMarks}`,
      );
    }

    //Tuition validation
    const tuition = await this.prisma.tuition.findUnique({
      where: {
        ownerId: userId,
      },
    });

    if (!tuition) {
      throw new BadRequestException('Tuition profile not found for this user');
    }
    // 2. Validate class
    const classRecord = await this.prisma.class.findUnique({
      where: {
        id: dto.classId,
      },
    });

    if (!classRecord) {
      throw new BadRequestException('Class not found');
    }

    // 3. Validate subject belongs to class
    const subject = await this.prisma.subject.findFirst({
      where: {
        id: dto.subjectId,
        classId: dto.classId,
      },
    });

    if (!subject) {
      throw new BadRequestException(
        'Subject does not belong to the selected class',
      );
    }

    // 4. Validate chapters belong to subject
    const chapters = await this.prisma.chapter.findMany({
      where: {
        id: {
          in: dto.chapterIds,
        },
        subjectId: dto.subjectId,
      },
      select: {
        id: true,
        name: true,
        chapterNo: true,
      },
    });

    if (chapters.length !== dto.chapterIds.length) {
      throw new BadRequestException(
        'One or more chapters do not belong to the selected subject',
      );
    }

    // 5. Get questions for each section
    const selectedQuestions: {
      questionId: string;
      marks: number;
      sectionName: string;
    }[] = [];

    for (const section of dto.sections) {
      const questions = await this.prisma.question.findMany({
        where: {
          isActive: true,

          subjectId: dto.subjectId,

          chapterId: {
            in: dto.chapterIds,
          },

          medium: dto.medium,

          type: section.type,
        },

        select: {
          id: true,
          questionText: true,
          difficulty: true,
        },
      });

      if (questions.length < section.count) {
        throw new BadRequestException(
          `Not enough ${section.type} questions available. Required: ${section.count}, Available: ${questions.length}`,
        );
      }

      // Randomly select questions
      const shuffled = [...questions].sort(() => Math.random() - 0.5);

      const selected = shuffled.slice(0, section.count);

      for (const question of selected) {
        selectedQuestions.push({
          questionId: question.id,
          marks: section.marks,
          sectionName: section.type,
        });
      }
    }

    // 6. Create paper + paper questions in one transaction
    const paper = await this.prisma.$transaction(async (tx) => {
      const createdPaper = await tx.questionPaper.create({
        data: {
          title: dto.title,
          medium: dto.medium,

          classId: dto.classId,
          subjectId: dto.subjectId,

          tuitionId: tuition.id,

          totalMarks: dto.totalMarks,
          durationMinutes: dto.durationMinutes,
        },
      });

      await tx.questionPaperQuestion.createMany({
        data: selectedQuestions.map((question, index) => ({
          paperId: createdPaper.id,

          questionId: question.questionId,

          questionNo: index + 1,

          marks: question.marks,

          sectionName: question.sectionName,
        })),
      });

      return createdPaper;
    });

    return {
      message: 'Question paper generated successfully',

      paperId: paper.id,

      title: paper.title,

      totalMarks: paper.totalMarks,

      durationMinutes: paper.durationMinutes,

      totalQuestions: selectedQuestions.length,
    };
  }
  async getQuestionPaper(paperId: string) {
    const paper = await this.prisma.questionPaper.findUnique({
      where: {
        id: paperId,
      },

      select: {
        id: true,
        title: true,
        medium: true,
        totalMarks: true,
        durationMinutes: true,
        tuition: {
          select: {
            id: true,
            name: true,
            logoStorageKey: true,
            logoFileName: true,
            logoMimeType: true,
          },
        },

        createdAt: true,

        class: {
          select: {
            id: true,
            name: true,
            classNo: true,
          },
        },

        subject: {
          select: {
            id: true,
            name: true,
          },
        },

        questions: {
          orderBy: {
            questionNo: 'asc',
          },

          select: {
            id: true,
            questionNo: true,
            marks: true,
            sectionName: true,

            question: {
              select: {
                id: true,
                externalId: true,
                questionText: true,
                questionContent: true,
                answerContent: true,
                type: true,
                difficulty: true,
                medium: true,

                chapter: {
                  select: {
                    id: true,
                    name: true,
                    chapterNo: true,
                  },
                },

                options: {
                  orderBy: {
                    optionKey: 'asc',
                  },

                  select: {
                    id: true,
                    optionKey: true,
                    optionText: true,
                  },
                },

                media: {
                  orderBy: {
                    sortOrder: 'asc',
                  },

                  select: {
                    id: true,
                    type: true,
                    location: true,
                    storageKey: true,
                    fileName: true,
                    mimeType: true,
                    sortOrder: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!paper) {
      throw new BadRequestException('Question paper not found');
    }

    return paper;
  }

  async getAnswerSheet(paperId: string) {
    const paper = await this.prisma.questionPaper.findUnique({
      where: {
        id: paperId,
      },

      select: {
        id: true,
        title: true,
        medium: true,
        totalMarks: true,
        durationMinutes: true,
        tuition: {
          select: {
            id: true,
            name: true,
            logoStorageKey: true,
            logoFileName: true,
            logoMimeType: true,
          },
        },

        class: {
          select: {
            id: true,
            name: true,
            classNo: true,
          },
        },

        subject: {
          select: {
            id: true,
            name: true,
          },
        },

        questions: {
          orderBy: {
            questionNo: 'asc',
          },

          select: {
            questionNo: true,
            marks: true,
            sectionName: true,

            question: {
              select: {
                id: true,
                type: true,
                answerContent: true,

                options: {
                  where: {
                    isCorrect: true,
                  },

                  select: {
                    optionKey: true,
                    optionText: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!paper) {
      throw new BadRequestException('Question paper not found');
    }
    console.log('ANSWER SHEET DATA:', JSON.stringify(paper, null, 2));

    return {
      id: paper.id,
      title: `${paper.title}`,
      medium: paper.medium,
      totalMarks: paper.totalMarks,
      durationMinutes: paper.durationMinutes,
      class: paper.class,
      subject: paper.subject,

      questions: paper.questions.map((item) => ({
        questionNo: item.questionNo,
        marks: item.marks,
        sectionName: item.sectionName,

        type: item.question.type,

        correctAnswer:
          item.question.type === QuestionType.MCQ
            ? (item.question.options[0] ?? null)
            : item.question.answerContent,
      })),
    };
  }
}
