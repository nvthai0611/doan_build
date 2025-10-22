import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class GetStudentLeaveRequestsQueryDto {
  @ApiPropertyOptional({ description: 'Trang hiện tại', example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Số lượng mỗi trang', example: 10 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái (pending, approved, rejected, cancelled)',
    example: 'pending',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'ID lớp học', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên học sinh' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ApproveRejectStudentLeaveRequestDto {
  @ApiPropertyOptional({ description: 'Ghi chú khi duyệt/từ chối' })
  @IsOptional()
  @IsString()
  notes?: string;
}

