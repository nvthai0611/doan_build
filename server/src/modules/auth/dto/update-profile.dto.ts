import { IsString, IsOptional, IsPhoneNumber } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  @IsPhoneNumber('VN')
  phone?: string;
}
