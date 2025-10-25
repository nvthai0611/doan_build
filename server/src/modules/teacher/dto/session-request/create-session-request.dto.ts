import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class CreateSessionRequestDto {
  @ApiProperty({ description: 'ID của lớp học' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'Ngày buổi học (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  sessionDate: string;

  @ApiProperty({ description: 'Giờ bắt đầu (HH:MM)' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ description: 'Giờ kết thúc (HH:MM)' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ description: 'ID phòng học (tùy chọn)', required: false })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiProperty({ description: 'Lý do yêu cầu tạo buổi học' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ description: 'Ghi chú thêm (tùy chọn)', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Loại yêu cầu', enum: ['makeup_session', 'extra_session'] })
  @IsString()
  @IsNotEmpty()
  requestType: 'makeup_session' | 'extra_session';
}
