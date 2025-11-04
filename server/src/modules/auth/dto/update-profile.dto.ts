import { IsString, IsOptional, IsEnum, IsDateString, ValidateIf, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Họ và tên' })
  @Expose()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  fullName?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại (VD: 0912345678 hoặc +84912345678)' })
  @Expose()
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @ValidateIf((o) => o.phone !== undefined && o.phone !== null && o.phone !== '')
  @IsString()
  @Matches(/^(\+84|0)[1-9][0-9]{8}$/, { 
    message: 'Số điện thoại phải là một số điện thoại hợp lệ (VD: 0912345678 hoặc +84912345678)' 
  })
  phone?: string;

  @ApiPropertyOptional({ description: 'URL ảnh đại diện hoặc base64 data URL' })
  @Expose()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  avatar?: string;

  @ApiPropertyOptional({ description: 'Giới tính', enum: Gender })
  @Expose()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === '' || value === null || value === undefined) {
      return undefined;
    }
    return value;
  })
  @ValidateIf((o) => o.gender !== undefined && o.gender !== null && o.gender !== '')
  @IsEnum(Gender, { message: 'giới tính phải là nam, nữ hoặc khác' })
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Ngày sinh (YYYY-MM-DD)', example: '1990-01-01' })
  @Expose()
  @IsOptional()
  @IsString()
  @IsDateString({}, { message: 'ngày sinh phải là một chuỗi ngày hợp lệ (YYYY-MM-DD)' })
  @Transform(({ value }) => {
    if (!value || value === '' || value === null || value === undefined) {
      return undefined;
    }
    return value;
  })
  birthDate?: string;
}
