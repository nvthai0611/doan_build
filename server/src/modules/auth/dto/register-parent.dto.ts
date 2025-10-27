import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDateString, IsEnum, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export class ChildDto {
  @ApiProperty({ description: 'Họ và tên con', example: 'Nguyễn Văn B' })
  @IsString()
  @IsNotEmpty({ message: 'Họ và tên con không được để trống' })
  fullName: string;

  @ApiProperty({ description: 'Ngày sinh con', example: '2015-01-01' })
  @IsDateString({}, { message: 'Ngày sinh không hợp lệ' })
  @IsNotEmpty({ message: 'Ngày sinh con không được để trống' })
  dateOfBirth: string;

  @ApiProperty({ description: 'Giới tính', enum: Gender, example: 'MALE' })
  @IsEnum(Gender, { message: 'Giới tính không hợp lệ' })
  @IsNotEmpty({ message: 'Giới tính con không được để trống' })
  gender: Gender;
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

  @ApiProperty({ 
    description: 'Danh sách con (ít nhất 1 con)', 
    type: [ChildDto],
    example: [{ fullName: 'Nguyễn Văn B', dateOfBirth: '2015-01-01', gender: 'MALE' }]
  })
  @IsArray({ message: 'Danh sách con phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => ChildDto)
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 con' })
  children: ChildDto[];
}
