import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ScheduleChangeStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export class ScheduleChangeFiltersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsEnum(ScheduleChangeStatus)
  status?: ScheduleChangeStatus;

  @IsOptional()
  @IsString()
  changeType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  classId?: number;
}
