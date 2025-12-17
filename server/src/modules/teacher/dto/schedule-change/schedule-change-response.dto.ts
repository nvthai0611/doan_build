import { Expose, Type } from 'class-transformer';

export class ClassResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  subject?: {
    name: string;
  };
}

export class SessionResponseDto {
  @Expose()
  id: string;

  @Expose()
  sessionDate: Date;

  @Expose()
  startTime: string;

  @Expose()
  endTime: string;
}

export class TeacherResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export class RoomResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  capacity: number;
}

export class ScheduleChangeResponseDto {
  @Expose()
  id: string;

  @Expose()
  classId: string;

  @Expose()
  @Type(() => ClassResponseDto)
  class: ClassResponseDto;

  @Expose()
  sessionId?: string;

  @Expose()
  @Type(() => SessionResponseDto)
  session: SessionResponseDto;

  @Expose()
  changeType: string;

  @Expose()
  originalDate: Date;

  @Expose()
  originalTime: string;

  @Expose()
  newDate?: Date;

  @Expose()
  newTime?: string;

  @Expose()
  newStartTime?: string;

  @Expose()
  newEndTime?: string;

  @Expose()
  newRoomId?: string;

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
  teacherId: string;

  @Expose()
  @Type(() => TeacherResponseDto)
  teacher: TeacherResponseDto;

  @Expose()
  requestedBy: string;

  @Expose()
  requestedAt: Date;

  @Expose()
  processedAt?: Date;

  @Expose()
  createdBy?: string;

  @Expose()
  approvedBy?: string;

  @Expose()
  approvedAt?: Date;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;
}
