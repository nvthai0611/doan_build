import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryTeacherDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['teacher', 'admin', 'center_owner'])
  role?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'all'])
  status?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  // Filter parameters
  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  birthYear?: string;

  @IsOptional()
  @IsString()
  hireDateFrom?: string;

  @IsOptional()
  @IsString()
  hireDateTo?: string;

}
