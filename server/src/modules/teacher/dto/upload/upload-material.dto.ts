import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UploadMaterialDto {
  @ApiProperty({ description: 'ID lớp học', example: 'uuid-string' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'Tiêu đề tài liệu', example: 'Bài tập chương 1' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ 
    description: 'Danh mục tài liệu', 
    example: 'lesson',
    enum: ['lesson', 'exercise', 'exam', 'material', 'reference']
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ description: 'Mô tả tài liệu' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'File tài liệu',
    type: 'string',
    format: 'binary'
  })
  file: any;
}

export class GetMaterialsDto {
  @ApiPropertyOptional({ description: 'ID lớp học' })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ description: 'Danh mục' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Trang', example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Số lượng mỗi trang', example: 10 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class MaterialResponseDto {
  @ApiProperty({ description: 'ID tài liệu' })
  id: number;

  @ApiProperty({ description: 'ID lớp học' })
  classId: string;

  @ApiProperty({ description: 'Tiêu đề' })
  title: string;

  @ApiProperty({ description: 'Tên file' })
  fileName: string;

  @ApiProperty({ description: 'Danh mục' })
  category: string;

  @ApiProperty({ description: 'URL file' })
  fileUrl: string;

  @ApiPropertyOptional({ description: 'Kích thước file (bytes)' })
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Loại file' })
  fileType?: string;

  @ApiPropertyOptional({ description: 'Mô tả' })
  description?: string;

  @ApiProperty({ description: 'Người upload' })
  uploadedBy: string;

  @ApiProperty({ description: 'Ngày upload' })
  uploadedAt: Date;

  @ApiProperty({ description: 'Số lượt tải xuống' })
  downloads: number;
}
