import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

export class ScheduleFiltersDto {
  @ApiPropertyOptional({ 
    description: 'Trạng thái buổi dạy',
    enum: ['scheduled', 'completed', 'cancelled', 'all'],
    default: 'all'
  })
  @IsOptional()
  @IsString()
  @IsIn(['scheduled', 'completed', 'cancelled', 'all'])
  status?: string = 'all';

  @ApiPropertyOptional({ 
    description: 'Loại buổi dạy',
    enum: ['regular', 'exam', 'makeup', 'all'],
    default: 'all'
  })
  @IsOptional()
  @IsString()
  @IsIn(['regular', 'exam', 'makeup', 'all'])
  type?: string = 'all';

  @ApiPropertyOptional({ 
    description: 'Từ ngày (YYYY-MM-DD)',
    example: '2024-09-01'
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ 
    description: 'Đến ngày (YYYY-MM-DD)',
    example: '2024-09-30'
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ 
    description: 'Từ khóa tìm kiếm (môn học, lớp, phòng)',
    example: 'Toán học'
  })
  @IsOptional()
  @IsString()
  search?: string;
}
