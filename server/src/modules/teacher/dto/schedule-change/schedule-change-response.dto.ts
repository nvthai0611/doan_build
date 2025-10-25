import { Expose, Type } from 'class-transformer';

export class ClassResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description?: string;
}

export class SessionResponseDto {
  @Expose()
  id: number;

  @Expose()
  sessionDate: Date;

  @Expose()
  startTime: string;

  @Expose()
  endTime: string;
}

export class TeacherResponseDto {
  @Expose()
  id: number;

  @Expose()
  userId: number;

  @Expose()
  user: {
    id: number;
    fullName: string;
    email: string;
  };
}

export class RoomResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  capacity: number;
}

export class ScheduleChangeResponseDto {
  @Expose()
  id: number;

  @Expose()
  classId: number;

  @Expose()
  @Type(() => ClassResponseDto)
  class: ClassResponseDto;

  @Expose()
  sessionId: number;

  @Expose()
  @Type(() => SessionResponseDto)
  session: SessionResponseDto;

  @Expose()
  changeType: string;

  @Expose()
  newDate?: Date;

  @Expose()
  newStartTime?: string;

  @Expose()
  newEndTime?: string;

  @Expose()
  newRoomId?: number;

  @Expose()
  @Type(() => RoomResponseDto)
  newRoom?: RoomResponseDto;

  @Expose()
  reason: string;

  @Expose()
  notes?: string;

  @Expose()
  status: string;

  @Expose()
  teacherId: number;

  @Expose()
  @Type(() => TeacherResponseDto)
  teacher: TeacherResponseDto;

  @Expose()
  createdBy: number;

  @Expose()
  approvedBy?: number;

  @Expose()
  approvedAt?: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
