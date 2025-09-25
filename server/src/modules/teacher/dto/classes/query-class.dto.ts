import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumberString } from 'class-validator';

export class ClassQueryDto {
  @ApiProperty({ 
    description: 'Trạng thái lớp học',
    enum: ['all', 'active', 'completed', 'draft', 'cancelled'],
    required: false,
    default: 'all'
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ 
    description: 'Từ khóa tìm kiếm (tên lớp, mã lớp)',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;



  @ApiProperty({ 
    description: 'Số trang',
    required: false,
    default: 1
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({ 
    description: 'Số lượng items per page',
    required: false,
    default: 10
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;
}