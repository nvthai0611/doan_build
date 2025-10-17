import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional, IsString, IsUUID, Matches } from 'class-validator'

export class CreateSessionDto {
  @ApiProperty({ description: 'ID lớp học', format: 'uuid' })
  @IsUUID()
  classId: string

  @ApiProperty({ description: 'Ngày học (YYYY-MM-DD)', example: '2025-10-20' })
  @IsDateString()
  sessionDate: string

  @ApiProperty({ description: 'Giờ bắt đầu (HH:mm)', example: '18:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime: string

  @ApiProperty({ description: 'Giờ kết thúc (HH:mm)', example: '19:30' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime: string

  @ApiPropertyOptional({ description: 'Phòng học (uuid)', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  roomId?: string

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsString()
  @IsOptional()
  notes?: string
}


