import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { Medium } from '@prisma/client';

import { GeneratePaperSectionDto } from './generate-paper-section.dto';

export class GenerateQuestionPaperDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsEnum(Medium)
  medium: Medium;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  chapterIds: string[];

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => GeneratePaperSectionDto)
  sections: GeneratePaperSectionDto[];

  @IsInt()
  @IsPositive()
  totalMarks: number;

  @IsInt()
  @IsPositive()
  durationMinutes: number;
}
