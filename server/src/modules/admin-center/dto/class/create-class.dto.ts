import { IsString, IsOptional, IsUUID, IsNumber, IsEnum, IsObject, IsDateString } from 'class-validator';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsNumber()
  maxStudents?: number;

  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['draft', 'active', 'completed', 'cancelled'])
  status?: string = 'draft';

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsObject()
  recurringSchedule?: any;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  expectedStartDate?: string;

  @IsOptional()
  @IsDateString()
  actualStartDate?: string;

  @IsOptional()
  @IsDateString()
  actualEndDate?: string;
}