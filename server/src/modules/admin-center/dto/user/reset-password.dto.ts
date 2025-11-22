import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword?: string;

  @IsOptional()
  @IsBoolean()
  forceLogout?: boolean;
}

