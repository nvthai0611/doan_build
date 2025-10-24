import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SessionRequestFiltersDto {
  @ApiProperty({ description: 'Trang hiện tại', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Số lượng mỗi trang', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ description: 'Trạng thái yêu cầu', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Loại yêu cầu', required: false })
  @IsOptional()
  @IsString()
  requestType?: string;
}
