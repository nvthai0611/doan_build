import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Email/Username hoặc mật khẩu không chính xác' })
  identifier: string; // Có thể là email hoặc username

  @IsString()
  @IsNotEmpty({ message: 'Email/Username hoặc mật khẩu không chính xác' })
  @MinLength(6, { message: 'Email/Username hoặc mật khẩu không chính xác' })
  @MaxLength(16, { message: 'Email/Username hoặc mật khẩu không chính xác' })
  password: string;
}
