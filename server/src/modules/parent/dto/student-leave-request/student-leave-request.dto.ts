import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateStudentLeaveRequestDto {
  @ApiProperty({ description: 'ID học sinh', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'Ngày bắt đầu nghỉ (YYYY-MM-DD)',
    example: '2025-10-23',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Ngày kết thúc nghỉ (YYYY-MM-DD)',
    example: '2025-10-25',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ description: 'Lý do nghỉ học', example: 'Con bị ốm' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class UpdateStudentLeaveRequestDto {
  @ApiPropertyOptional({
    description: 'Ngày bắt đầu nghỉ (YYYY-MM-DD)',
    example: '2025-10-23',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc nghỉ (YYYY-MM-DD)',
    example: '2025-10-25',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Lý do nghỉ học' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class GetStudentLeaveRequestsQueryDto {
  @ApiPropertyOptional({ description: 'Trang hiện tại', example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Số lượng mỗi trang', example: 10 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Trạng thái đơn', example: 'pending' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'ID học sinh', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ description: 'ID lớp học', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  classId?: string;
}

export class GetAffectedSessionsQueryDto {
  @ApiProperty({ description: 'ID học sinh', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
    example: '2025-10-23',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Ngày kết thúc (YYYY-MM-DD)',
    example: '2025-10-25',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

