import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryLeaveRequestDto {
  @IsString()
  @IsOptional()
  teacherId?: string;

  @IsEnum(['all', 'pending', 'approved', 'rejected'])
  @IsOptional()
  status?: string = 'all';

  @IsString()
  @IsOptional()
  search?: string = '';

  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @IsDateString()
  @IsOptional()
  toDate?: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  limit?: number = 10;
}
