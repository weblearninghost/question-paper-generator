import { IsEnum, IsInt, IsPositive } from 'class-validator';

import { QuestionType } from '@prisma/client';

export class GeneratePaperSectionDto {
  @IsEnum(QuestionType)
  type: QuestionType;

  @IsInt()
  @IsPositive()
  count: number;

  @IsInt()
  @IsPositive()
  marks: number;
}
