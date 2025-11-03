import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDateString, IsEnum, IsArray, ValidateNested, ArrayMinSize, Matches, MaxLength, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

enum RelationshipType {
  FATHER = 'FATHER',
  MOTHER = 'MOTHER'
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

  @ApiProperty({ description: 'Tên trường học', example: 'Trường THCS ABC' })
  @IsString()
  @IsNotEmpty({ message: 'Tên trường học không được để trống' })
  schoolName: string;

  @ApiProperty({ description: 'Địa chỉ trường học', example: '123 Main St', required: false })
  @IsString()
  @IsOptional()
  schoolAddress?: string;
}

export class RegisterParentDto {
  @IsString({ message: 'Tên đăng nhập phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  @MaxLength(20, { message: 'Tên đăng nhập không được quá 20 ký tự' })
  @Matches(/^[a-zA-Z0-9_]+$/, { 
    message: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới' 
  })
  username: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'Định dạng email không hợp lệ'
  })
  email: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(32, { message: 'Mật khẩu không được quá 32 ký tự' })
  password: string;

  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @MinLength(2, { message: 'Họ và tên phải có ít nhất 2 ký tự' })
  fullName: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^[0-9]{10,11}$/, { 
    message: 'Số điện thoại phải có 10-11 chữ số và chỉ chứa số' 
  })
  phone: string;

  @IsDateString({}, { message: 'Ngày sinh không hợp lệ' })
  @IsOptional()
  birthDate?: string;

  @IsEnum(RelationshipType, { message: 'Quan hệ không hợp lệ' })
  @IsNotEmpty({ message: 'Quan hệ không được để trống' })
  relationshipType: RelationshipType;

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
