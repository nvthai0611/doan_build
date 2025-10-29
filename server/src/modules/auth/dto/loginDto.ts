import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Email hoặc tên đăng nhập không được để trống' })
  identifier: string; // Có thể là email hoặc username

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(16, { message: 'Mật khẩu không được quá 16 ký tự' })
  password: string;
}
