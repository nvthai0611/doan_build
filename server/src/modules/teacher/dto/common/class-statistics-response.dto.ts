import { ApiProperty } from '@nestjs/swagger';

export class AttendanceStatsDto {
  @ApiProperty({ description: 'Trạng thái điểm danh' })
  status: string;

  @ApiProperty({ description: 'Số lượng' })
  _count: {
    status: number;
  };
}

export class GradeStatsDto {
  @ApiProperty({ description: 'Điểm trung bình', required: false })
  _avg?: {
    score?: number;
  };

  @ApiProperty({ description: 'Điểm cao nhất', required: false })
  _max?: {
    score?: number;
  };

  @ApiProperty({ description: 'Điểm thấp nhất', required: false })
  _min?: {
    score?: number;
  };
}

export class ClassStatisticsDataDto {
  @ApiProperty({ description: 'Tổng số học sinh' })
  totalStudents: number;

  @ApiProperty({ description: 'Thống kê điểm danh', type: [AttendanceStatsDto] })
  attendanceStats: AttendanceStatsDto[];

  @ApiProperty({ description: 'Thống kê điểm số' })
  gradeStats: GradeStatsDto;
}

export class ClassStatisticsResponseDto {
  @ApiProperty({ description: 'Trạng thái thành công' })
  success: boolean;

  @ApiProperty({ description: 'Dữ liệu thống kê', type: ClassStatisticsDataDto })
  data: ClassStatisticsDataDto;

  @ApiProperty({ description: 'Thông báo' })
  message: string;
}
