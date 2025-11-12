import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateStudentLeaveRequestDto {
  @ApiProperty({ description: 'ID học sinh', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'ID lớp học', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'Danh sách sessionId được xin nghỉ', type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  sessionIds: string[];

  @ApiProperty({ description: 'Lý do nghỉ học', example: 'Con bị ốm' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class UpdateStudentLeaveRequestDto {
  @ApiPropertyOptional({ description: 'Lý do nghỉ học' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'Danh sách sessionId được xin nghỉ', type: [String] })
  @IsArray()
  @IsOptional()
  sessionIds?: string[];
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

export class GetSessionsByClassQueryDto {
  @ApiProperty({ description: 'ID học sinh', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'ID lớp học', example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;
}

