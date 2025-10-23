import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDateString, IsEnum } from 'class-validator';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export class RegisterParentDto {
  @IsString({ message: 'Tên đăng nhập phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  username: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @IsDateString({}, { message: 'Ngày sinh không hợp lệ' })
  @IsNotEmpty({ message: 'Ngày sinh không được để trống' })
  birthDate: string;

  @IsEnum(Gender, { message: 'Giới tính không hợp lệ' })
  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  gender: Gender;
}

