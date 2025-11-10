import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryClassDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum([
    'draft',
    'ready',
    'active',
    'completed',
    'suspended',
    'cancelled',
    'all',
  ])
  status?: string = 'all';

  @IsOptional()
  @IsString()
  gradeId?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsString()
  feeStructureId?: string;

  @IsOptional()
  @IsString()
  dayOfWeek?: string;

  @IsOptional()
  @IsEnum(['morning', 'afternoon', 'evening', 'all'])
  shift?: string = 'all';

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
