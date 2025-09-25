import { ApiProperty } from '@nestjs/swagger';

export class RoomDto {
  @ApiProperty({ description: 'ID của phòng học' })
  id: string;

  @ApiProperty({ description: 'Tên phòng học' })
  name: string;

  @ApiProperty({ description: 'Mô tả phòng học', required: false })
  description?: string;
}

export class ClassDto {
  @ApiProperty({ description: 'ID của lớp học' })
  id: string;

  @ApiProperty({ description: 'Tên lớp học' })
  name: string;

  @ApiProperty({ description: 'ID của giáo viên' })
  teacherId: string;

  @ApiProperty({ description: 'Thông tin phòng học', type: RoomDto })
  room: RoomDto;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: Date;
}

export class ClassesListResponseDto {
  @ApiProperty({ description: 'Trạng thái thành công' })
  success: boolean;

  @ApiProperty({ description: 'Thông báo' })
  message: string;

  @ApiProperty({ description: 'Danh sách lớp học', type: [ClassDto] })
  data: ClassDto[];
}

export class ClassResponseDto {
  @ApiProperty({ description: 'Trạng thái thành công' })
  success: boolean;

  @ApiProperty({ description: 'Thông báo' })
  message: string;

  @ApiProperty({ description: 'Thông tin lớp học', type: ClassDto })
  data: ClassDto;
}

export class CountByStatusResponseDto {
  @ApiProperty({ description: 'Tổng số lớp học' })
  total: number;

  @ApiProperty({ description: 'Số lớp học hoạt động' })
  active: number;

  @ApiProperty({ description: 'Số lớp học hoàn thành' })
  completed: number;

  @ApiProperty({ description: 'Số lớp học theo kế hoạch' })
  draft: number;

  @ApiProperty({ description: 'Số lớp học hủy' })
  cancelled: number;
}