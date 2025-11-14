import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({ example: 'Trường THPT Nguyễn Huệ', description: 'Tên trường học' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123 Đường ABC, Quận XYZ, TP.HCM', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '0901234567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}
