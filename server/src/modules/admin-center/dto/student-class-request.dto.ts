import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';

export class GetStudentClassRequestsDto {
  @ApiProperty({ description: 'Lọc theo trạng thái', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Lọc theo ID lớp học', required: false })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiProperty({ description: 'Lọc theo ID học sinh', required: false })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiProperty({ description: 'Số trang', required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Số lượng mỗi trang', required: false, default: 20 })
  @IsOptional()
  limit?: number;
}

export class RejectRequestDto {
  @ApiProperty({ description: 'Lý do từ chối', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

