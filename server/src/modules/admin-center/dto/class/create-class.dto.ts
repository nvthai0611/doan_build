import { IsString, IsOptional, IsUUID, IsNumber, IsEnum, IsObject, IsDateString, ValidateIf } from 'class-validator';

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
  @IsUUID()
  gradeId?: string;

  @IsOptional()
  @IsNumber()
  maxStudents?: number;

  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsOptional()
  @ValidateIf((o) => o.teacherId !== undefined && o.teacherId !== null && o.teacherId !== '')
  @IsUUID()
  teacherId?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(['draft', 'ready','active', 'completed', 'cancelled'])
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