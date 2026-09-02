import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

import { Difficulty, Medium, QuestionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface ExcelQuestionRow {
  externalId?: string;
  class?: string;
  subject?: string;
  chapter?: string;
  chapterNo?: string | number;
  medium?: string;
  type?: string;
  question?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  answer?: string;
  difficulty?: string;
  marks?: string | number;
}

export interface NormalizedQuestionRow {
  externalId: string;
  className: string;
  subjectName: string;
  chapterName: string;
  chapterNo?: number;
  medium?: Medium;
  type?: QuestionType;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  answer: string;
  difficulty?: Difficulty;
  marks?: number;
}

@Injectable()
export class QuestionBankService {
  constructor(private readonly prisma: PrismaService) {}

  async previewExcel(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Excel file is required');
    }

    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
    });

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new BadRequestException('Excel file does not contain any sheet');
    }

    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new BadRequestException('Unable to read Excel worksheet');
    }

    /*
     * ---------------------------------------------------------
     * 1. Validate Excel headers
     * ---------------------------------------------------------
     */

    const requiredHeaders = [
      'externalId',
      'class',
      'subject',
      'chapter',
      'chapterNo',
      'medium',
      'type',
      'question',
      'optionA',
      'optionB',
      'optionC',
      'optionD',
      'correctAnswer',
      'answer',
      'difficulty',
      'marks',
    ];

    const headerRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      {
        header: 1,
        defval: '',
      },
    );

    if (!headerRows.length) {
      throw new BadRequestException('Excel sheet does not contain any data');
    }

    const firstRow = headerRows[0];

    const actualHeaders = Array.isArray(firstRow)
      ? firstRow.map((header) => this.clean(header))
      : [];

    const missingHeaders = requiredHeaders.filter(
      (header) => !actualHeaders.includes(header),
    );

    if (missingHeaders.length) {
      throw new BadRequestException({
        message: 'Invalid Excel headers',
        missingHeaders,
        expectedHeaders: requiredHeaders,
      });
    }

    /*
     * ---------------------------------------------------------
     * 2. Read Excel rows
     * ---------------------------------------------------------
     */

    const rows = XLSX.utils.sheet_to_json<ExcelQuestionRow>(worksheet, {
      defval: '',
    });

    if (!rows.length) {
      throw new BadRequestException(
        'Excel sheet does not contain any questions',
      );
    }

    /*
     * ---------------------------------------------------------
     * 3. Validate and normalize rows
     * ---------------------------------------------------------
     */

    const errors: Array<{
      row: number;
      errors: string[];
    }> = [];

    const normalizedRows: NormalizedQuestionRow[] = [];

    /*
     * Track externalIds to detect duplicates inside
     * the uploaded Excel file.
     */
    const externalIdMap = new Map<string, number>();

    rows.forEach((row, index) => {
      const rowNumber = index + 2;

      const chapterNoResult = this.parseOptionalInt(row.chapterNo);

      const marksResult = this.parseOptionalPositiveInt(row.marks);

      const normalized: NormalizedQuestionRow = {
        externalId: this.clean(row.externalId),

        className: this.clean(row.class),

        subjectName: this.clean(row.subject),

        chapterName: this.clean(row.chapter),

        chapterNo: chapterNoResult.value,

        medium: this.normalizeMedium(row.medium),

        type: this.normalizeQuestionType(row.type),

        question: this.clean(row.question),

        optionA: this.clean(row.optionA),

        optionB: this.clean(row.optionB),

        optionC: this.clean(row.optionC),

        optionD: this.clean(row.optionD),

        correctAnswer: this.clean(row.correctAnswer).toUpperCase(),

        answer: this.clean(row.answer),

        difficulty: this.normalizeDifficulty(row.difficulty),

        marks: marksResult.value,
      };

      const rowErrors: string[] = [];

      /*
       * -------------------------------------------------------
       * Required fields
       * -------------------------------------------------------
       */

      if (!normalized.externalId) {
        rowErrors.push('externalId is required');
      }

      if (!normalized.className) {
        rowErrors.push('class is required');
      }

      if (!normalized.subjectName) {
        rowErrors.push('subject is required');
      }

      if (!normalized.chapterName) {
        rowErrors.push('chapter is required');
      }

      if (!normalized.question) {
        rowErrors.push('question is required');
      }

      if (!normalized.answer) {
        rowErrors.push('answer is required');
      }

      /*
       * -------------------------------------------------------
       * Enum validations
       * -------------------------------------------------------
       */

      if (!normalized.medium) {
        rowErrors.push('medium must be ENGLISH or MARATHI');
      }

      if (!normalized.type) {
        rowErrors.push('type must be MCQ, SHORT_ANSWER or LONG_ANSWER');
      }

      /*
       * -------------------------------------------------------
       * Chapter number validation
       * -------------------------------------------------------
       */

      if (
        row.chapterNo !== undefined &&
        this.clean(row.chapterNo) !== '' &&
        chapterNoResult.invalid
      ) {
        rowErrors.push('chapterNo must be a valid integer');
      }

      /*
       * -------------------------------------------------------
       * Marks validation
       * -------------------------------------------------------
       */

      if (
        row.marks !== undefined &&
        this.clean(row.marks) !== '' &&
        marksResult.invalid
      ) {
        rowErrors.push('marks must be a positive integer');
      }

      /*
       * -------------------------------------------------------
       * Difficulty validation
       * -------------------------------------------------------
       */

      const difficultyValue = this.clean(row.difficulty);

      if (difficultyValue && !normalized.difficulty) {
        rowErrors.push('difficulty must be EASY, MEDIUM or HARD');
      }

      /*
       * -------------------------------------------------------
       * MCQ validation
       * -------------------------------------------------------
       */

      if (normalized.type === QuestionType.MCQ) {
        if (!normalized.optionA) {
          rowErrors.push('optionA is required for MCQ');
        }

        if (!normalized.optionB) {
          rowErrors.push('optionB is required for MCQ');
        }

        if (!normalized.optionC) {
          rowErrors.push('optionC is required for MCQ');
        }

        if (!normalized.optionD) {
          rowErrors.push('optionD is required for MCQ');
        }

        if (!['A', 'B', 'C', 'D'].includes(normalized.correctAnswer)) {
          rowErrors.push('correctAnswer must be A, B, C or D for MCQ');
        }
      }

      /*
       * -------------------------------------------------------
       * Descriptive question validation
       * -------------------------------------------------------
       */

      if (
        normalized.type === QuestionType.SHORT_ANSWER ||
        normalized.type === QuestionType.LONG_ANSWER
      ) {
        if (!normalized.answer) {
          rowErrors.push('answer is required for descriptive questions');
        }

        /*
         * Descriptive questions should not have MCQ options.
         */
        if (
          normalized.optionA ||
          normalized.optionB ||
          normalized.optionC ||
          normalized.optionD
        ) {
          rowErrors.push('options should be empty for descriptive questions');
        }

        if (normalized.correctAnswer) {
          rowErrors.push(
            'correctAnswer should be empty for descriptive questions',
          );
        }
      }

      /*
       * -------------------------------------------------------
       * Duplicate externalId validation
       * -------------------------------------------------------
       */

      if (normalized.externalId) {
        const previousRow = externalIdMap.get(normalized.externalId);

        if (previousRow) {
          rowErrors.push(
            `duplicate externalId "${normalized.externalId}" already exists in row ${previousRow}`,
          );
        } else {
          externalIdMap.set(normalized.externalId, rowNumber);
        }
      }

      /*
       * -------------------------------------------------------
       * Store errors
       * -------------------------------------------------------
       */

      if (rowErrors.length) {
        errors.push({
          row: rowNumber,
          errors: rowErrors,
        });
      }

      normalizedRows.push(normalized);
    });

    /*
     * ---------------------------------------------------------
     * 4. Return validation errors
     * ---------------------------------------------------------
     */

    if (errors.length) {
      throw new BadRequestException({
        message: 'Excel validation failed',
        totalQuestions: rows.length,
        validQuestions: rows.length - errors.length,
        invalidQuestions: errors.length,
        errors,
      });
    }

    /*
     * ---------------------------------------------------------
     * 5. Successful preview
     * ---------------------------------------------------------
     */

    return {
      message: 'Excel validation successful',

      totalQuestions: normalizedRows.length,

      validQuestions: normalizedRows.length,

      invalidQuestions: 0,

      questions: normalizedRows,
    };
  }

  /*
   * =========================================================
   * Helper Methods
   * =========================================================
   */

  private clean(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value).trim();
  }

  private parseOptionalInt(value: unknown): {
    value: number | undefined;
    invalid: boolean;
  } {
    const cleaned = this.clean(value);

    if (!cleaned) {
      return {
        value: undefined,
        invalid: false,
      };
    }

    const parsed = Number(cleaned);

    if (!Number.isInteger(parsed)) {
      return {
        value: undefined,
        invalid: true,
      };
    }

    return {
      value: parsed,
      invalid: false,
    };
  }

  private parseOptionalPositiveInt(value: unknown): {
    value: number | undefined;
    invalid: boolean;
  } {
    const cleaned = this.clean(value);

    if (!cleaned) {
      return {
        value: undefined,
        invalid: false,
      };
    }

    const parsed = Number(cleaned);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      return {
        value: undefined,
        invalid: true,
      };
    }

    return {
      value: parsed,
      invalid: false,
    };
  }

  private normalizeMedium(value: unknown): Medium | undefined {
    const normalized = this.clean(value).toUpperCase();

    if (normalized === Medium.ENGLISH) {
      return Medium.ENGLISH;
    }

    if (normalized === Medium.MARATHI) {
      return Medium.MARATHI;
    }

    return undefined;
  }

  private normalizeQuestionType(value: unknown): QuestionType | undefined {
    const normalized = this.clean(value).toUpperCase();

    if (normalized === QuestionType.MCQ) {
      return QuestionType.MCQ;
    }

    if (normalized === QuestionType.SHORT_ANSWER) {
      return QuestionType.SHORT_ANSWER;
    }

    if (normalized === QuestionType.LONG_ANSWER) {
      return QuestionType.LONG_ANSWER;
    }

    return undefined;
  }

  private normalizeDifficulty(value: unknown): Difficulty | undefined {
    const normalized = this.clean(value).toUpperCase();

    if (!normalized) {
      return undefined;
    }

    if (normalized === Difficulty.EASY) {
      return Difficulty.EASY;
    }

    if (normalized === Difficulty.MEDIUM) {
      return Difficulty.MEDIUM;
    }

    if (normalized === Difficulty.HARD) {
      return Difficulty.HARD;
    }

    return undefined;
  }
}
