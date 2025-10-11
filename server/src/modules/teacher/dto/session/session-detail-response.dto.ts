import { ApiProperty } from '@nestjs/swagger';

export class StudentInSessionDto {
  @ApiProperty({ description: 'ID học viên' })
  id: string;

  @ApiProperty({ description: 'Tên học viên' })
  name: string;

  @ApiProperty({ description: 'Avatar học viên', required: false })
  avatar?: string;

  @ApiProperty({ description: 'Trạng thái điểm danh', required: false })
  attendanceStatus?: string;
}

export class SessionDetailResponseDto {
  @ApiProperty({ description: 'ID buổi học' })
  id: string;

  @ApiProperty({ description: 'Ngày diễn ra (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ description: 'Giờ bắt đầu' })
  startTime: string;

  @ApiProperty({ description: 'Giờ kết thúc' })
  endTime: string;

  @ApiProperty({ description: 'Tên môn học' })
  subject: string;

  @ApiProperty({ description: 'Tên lớp học' })
  className: string;

  @ApiProperty({ description: 'Tên phòng học' })
  room: string;

  @ApiProperty({ description: 'Số lượng học viên' })
  studentCount: number;

  @ApiProperty({ description: 'Trạng thái buổi học' })
  status: string;

  @ApiProperty({ description: 'Ghi chú', required: false })
  notes?: string;

  @ApiProperty({ description: 'Loại buổi học' })
  type: string;

  @ApiProperty({ description: 'ID giáo viên' })
  teacherId: string;

  @ApiProperty({ description: 'Tên giáo viên', required: false })
  teacherName?: string;

  @ApiProperty({ description: 'Danh sách học viên', type: [StudentInSessionDto], required: false })
  students?: StudentInSessionDto[];

  @ApiProperty({ description: 'Thời gian tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  updatedAt: Date;
}
