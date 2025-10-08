import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'Avatar URL của học sinh' })
  avatar: string;

  @ApiProperty({ description: 'Tên đầy đủ của học sinh' })
  fullName: string;
}

export class StudentResponseDto {
  @ApiProperty({ description: 'ID của học sinh' })
  id: string;

  @ApiProperty({ description: 'ID của user' })
  userId: string;

  @ApiProperty({ description: 'Mã số học sinh' })
  studentCode: string;

  @ApiProperty({ description: 'Địa chỉ học sinh' })
  address: string;

  @ApiProperty({ description: 'Khối lớp' })
  grade: string;

  @ApiProperty({ description: 'ID trường học' })
  schoolId: string;

  @ApiProperty({ description: 'ID phụ huynh' })
  parentId: string;

  @ApiProperty({ type: UserResponseDto, description: 'Thông tin user' })
  user: UserResponseDto;
}

export class ClassResponseDto {
  @ApiProperty({ description: 'Tên lớp học' })
  name: string;
}

export class SessionResponseDto {
  @ApiProperty({ description: 'ID của buổi học' })
  id: string;

  @ApiProperty({ description: 'ID của lớp học' })
  classId: string;

  @ApiProperty({ description: 'Năm học' })
  academicYear: string;

  @ApiProperty({ description: 'Ngày học', type: Date })
  sessionDate: Date;

  @ApiProperty({ description: 'Giờ bắt đầu' })
  startTime: string;

  @ApiProperty({ description: 'Giờ kết thúc' })
  endTime: string;

  @ApiProperty({ description: 'ID phòng học' })
  roomId: string;

  @ApiProperty({ description: 'Trạng thái buổi học' })
  status: string;

  @ApiProperty({ description: 'Ghi chú buổi học' })
  notes: string;

  @ApiProperty({ description: 'Ngày tạo', type: Date })
  createdAt: Date;

  @ApiProperty({ type: ClassResponseDto, description: 'Thông tin lớp học' })
  class: ClassResponseDto;
}

export class AttendanceResponseDto {
  @ApiProperty({ description: 'ID của bản ghi điểm danh' })
  id: string;

  @ApiProperty({ description: 'ID của buổi học' })
  sessionId: string;

  @ApiProperty({ description: 'ID của học sinh' })
  studentId: string;

  @ApiProperty({ 
    description: 'Trạng thái điểm danh',
    enum: ['present', 'absent', 'late', 'excused']
  })
  status: string;

  @ApiProperty({ description: 'Ghi chú điểm danh', required: false })
  note?: string;

  @ApiProperty({ description: 'ID người ghi nhận' })
  recordedBy: string;

  @ApiProperty({ description: 'Thời gian ghi nhận', type: Date })
  recordedAt: Date;

  @ApiProperty({ type: StudentResponseDto, description: 'Thông tin học sinh' })
  student: StudentResponseDto;

  @ApiProperty({ type: SessionResponseDto, description: 'Thông tin buổi học' })
  session: SessionResponseDto;
}

export class GetAttendanceResponseDto {
  @ApiProperty({ 
    type: [AttendanceResponseDto], 
    description: 'Danh sách điểm danh' 
  })
  data: AttendanceResponseDto[];

  @ApiProperty({ description: 'Thông báo kết quả' })
  message: string;
}