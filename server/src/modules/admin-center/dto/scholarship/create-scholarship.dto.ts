import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateScholarshipDto {
  @ApiProperty({ example: 'Học bổng xuất sắc', description: 'Tên học bổng' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Học bổng dành cho học sinh có thành tích xuất sắc', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 20, description: 'Phần trăm giảm giá (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  percent: number;

  @ApiProperty({ required: false, description: 'Điều kiện xét học bổng (JSON)' })
  @IsOptional()
  criteria?: any;

  @ApiProperty({ example: true, required: false, description: 'Trạng thái hoạt động' })
  @IsOptional()
  isActive?: boolean;
}

