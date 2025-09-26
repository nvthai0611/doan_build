import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateScheduleStatusDto {
  @ApiProperty({ 
    description: 'Trạng thái mới của buổi dạy',
    enum: ['completed', 'cancelled'],
    example: 'completed'
  })
  @IsString()
  @IsIn(['completed', 'cancelled'])
  status: 'completed' | 'cancelled';

  @ApiPropertyOptional({ 
    description: 'Ghi chú khi cập nhật trạng thái',
    example: 'Buổi dạy đã hoàn thành thành công'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
