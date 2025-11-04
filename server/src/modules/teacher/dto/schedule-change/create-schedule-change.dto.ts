import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsInt, Min } from 'class-validator';

export enum ScheduleChangeType {
  RESCHEDULE = 'reschedule',
  CANCEL = 'cancel',
  EXTEND = 'extend',
}

export class CreateScheduleChangeDto {
  @IsInt()
  @Min(1)
  classId: number;

  @IsInt()
  @Min(1)
  sessionId: number;

  @IsEnum(ScheduleChangeType)
  changeType: ScheduleChangeType;

  @IsDateString()
  newDate?: string;

  @IsString()
  @IsOptional()
  newStartTime?: string;

  @IsString()
  @IsOptional()
  newEndTime?: string;

  @IsInt()
  @IsOptional()
  newRoomId?: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
