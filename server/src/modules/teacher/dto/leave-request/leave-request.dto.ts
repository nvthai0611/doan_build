import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LeaveRequestDto {
  @ApiProperty({ description: 'Loại nghỉ', example: 'sick_leave' })
  @IsString()
  @IsNotEmpty()
  leaveType: string;

  @ApiProperty({ description: 'Ngày bắt đầu nghỉ (YYYY-MM-DD)', example: '2025-10-10' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Ngày kết thúc nghỉ (YYYY-MM-DD)', example: '2025-10-12' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Lý do xin nghỉ' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Tên tệp đính kèm (nếu có)' })
  @IsOptional()
  @IsString()
  attachmentFileName?: string;
}

export class AffectedSessionsQueryDto {
  @ApiProperty({ description: 'Ngày bắt đầu (YYYY-MM-DD)', example: '2025-10-10' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'Ngày kết thúc (YYYY-MM-DD)', example: '2025-10-12' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

export class AffectedSessionItemDto {
  @ApiProperty({ description: 'ID buổi học' })
  id: string;

  @ApiProperty({ description: 'Ngày học (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ description: 'Khung giờ hiển thị', example: '08:00 - 10:00' })
  time: string;

  @ApiProperty({ description: 'Tên lớp' })
  className: string;

  @ApiProperty({ description: 'Phòng học', required: false })
  room: string;

  @ApiProperty({ description: 'Mặc định chọn', example: true })
  selected: boolean;

  @ApiPropertyOptional({ description: 'ID giáo viên dạy thay (nếu có)' })
  replacementTeacherId?: string;
}
