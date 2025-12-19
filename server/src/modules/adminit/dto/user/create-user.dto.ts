import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Gender } from 'src/common/constants';

const USER_ROLE_VALUES = [
  'admin',
  'center_owner',
  'teacher',
  'parent',
  'student',
] as const;

export type UserRoleType = (typeof USER_ROLE_VALUES)[number];

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @MinLength(3, { message: 'Họ và tên phải có ít nhất 3 ký tự' })
  fullName: string;

  @IsString({ message: 'Tên đăng nhập phải là chuỗi' })
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  @MaxLength(30, { message: 'Tên đăng nhập không được vượt quá 30 ký tự' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'Tên đăng nhập chỉ được chứa chữ, số và _ . -',
  })
  username: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @Matches(/^[0-9]{8,15}$/, {
    message: 'Số điện thoại chỉ được chứa số và có 8-15 ký tự',
  })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Avatar phải là chuỗi URL' })
  avatar?: string | null;

  @IsEnum(USER_ROLE_VALUES, { message: 'Vai trò người dùng không hợp lệ' })
  role: UserRoleType;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  password?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'Giới tính không hợp lệ' })
  gender?: Gender;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày sinh không hợp lệ' })
  birthDate?: string | null;

  @IsOptional()
  @IsString()
  note?: string;
}