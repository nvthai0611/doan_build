import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
} from 'class-validator';

export enum ScheduleChangeType {
  RESCHEDULE = 'reschedule',
  CANCEL = 'cancel',
  EXTEND = 'extend',
}

export class CreateScheduleChangeDto {
  @IsUUID()
  classId: string;

  @IsUUID()
  sessionId: string;

  @IsEnum(ScheduleChangeType)
  changeType: ScheduleChangeType;

  @IsDateString()
  @IsNotEmpty()
  newDate: string;

  @IsString()
  @IsNotEmpty()
  newStartTime: string;

  @IsString()
  @IsNotEmpty()
  newEndTime: string;

  @IsUUID()
  @IsOptional()
  newRoomId?: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
