import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';

export class RescheduleSessionDto {
  @ApiProperty({ 
    description: 'Ngày mới (YYYY-MM-DD)',
    example: '2024-10-15'
  })
  @IsDateString()
  @IsNotEmpty()
  newDate: string;

  @ApiProperty({ 
    description: 'Giờ bắt đầu mới',
    example: '14:00'
  })
  @IsString()
  @IsNotEmpty()
  newStartTime: string;

  @ApiProperty({ 
    description: 'Giờ kết thúc mới',
    example: '16:00'
  })
  @IsString()
  @IsNotEmpty()
  newEndTime: string;

  @ApiProperty({ 
    description: 'ID phòng học mới',
    required: false
  })
  @IsString()
  @IsOptional()
  newRoomId?: string;

  @ApiProperty({ 
    description: 'Lý do dời lịch',
    example: 'Giáo viên bị ốm'
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ 
    description: 'Ghi chú thêm',
    required: false
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
