import { ApiProperty } from '@nestjs/swagger';

export class SessionRequestResponseDto {
  @ApiProperty({ description: 'ID của yêu cầu' })
  id: string;

  @ApiProperty({ description: 'Loại yêu cầu' })
  requestType: string;

  @ApiProperty({ description: 'Ngày buổi học' })
  sessionDate: string;

  @ApiProperty({ description: 'Giờ bắt đầu' })
  startTime: string;

  @ApiProperty({ description: 'Giờ kết thúc' })
  endTime: string;

  @ApiProperty({ description: 'Lý do yêu cầu' })
  reason: string;

  @ApiProperty({ description: 'Ghi chú', required: false })
  notes?: string;

  @ApiProperty({ description: 'Trạng thái yêu cầu' })
  status: string;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày duyệt', required: false })
  approvedAt?: Date;

  @ApiProperty({ description: 'Thông tin lớp học' })
  class: {
    id: string;
    name: string;
    subject: {
      name: string;
    };
  };

  @ApiProperty({ description: 'Thông tin phòng học', required: false })
  room?: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: 'Thông tin giáo viên' })
  teacher: {
    id: string;
    user: {
      fullName: string;
    };
  };

  @ApiProperty({ description: 'Người tạo yêu cầu' })
  createdByUser: {
    id: string;
    fullName: string;
  };

  @ApiProperty({ description: 'Người duyệt yêu cầu', required: false })
  approvedByUser?: {
    id: string;
    fullName: string;
  };
}
