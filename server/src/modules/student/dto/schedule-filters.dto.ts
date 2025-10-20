import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, ValidateIf } from 'class-validator';

export class ScheduleFiltersDto {
  @ApiPropertyOptional({ 
    description: 'Ngày bắt đầu (YYYY-MM-DD)', 
    example: '2024-01-01',
    type: 'string',
    format: 'date'
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate phải có định dạng YYYY-MM-DD'
  })
  startDate?: string;

  @ApiPropertyOptional({ 
    description: 'Ngày kết thúc (YYYY-MM-DD)', 
    example: '2024-12-31',
    type: 'string',
    format: 'date'
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate phải có định dạng YYYY-MM-DD'
  })
  @ValidateIf((o) => o.startDate && o.endDate)
  endDate?: string;
}

