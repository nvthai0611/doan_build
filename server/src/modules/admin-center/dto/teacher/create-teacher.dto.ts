import {
  IsEmail,
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Gender } from 'src/common/constants';

export class CreateTeacherDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'Định dạng email không hợp lệ',
  })
  email: string;

  @IsString({ message: 'Họ và tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @MinLength(5, {
    message: 'Họ và tên phải có ít nhất 5 ký tự tối đa 50 ký tự',
  })
  @MaxLength(50, {
    message: 'Họ và tên phải có ít nhất 5 ký tự tối đa 50 ký tự',
  })
  @Matches(/^[a-zA-ZÀ-ỹ\s]+$/, {
    message: 'Họ và tên chỉ được chứa chữ cái và khoảng trắng',
  })
  fullName: string;

  @IsString({ message: 'Tên đăng nhập phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @MinLength(3, {
    message: 'Tên đăng nhập phải có ít nhất 3 ký tự , tối đa 20 ký tự',
  })
  @MaxLength(20, {
    message: 'Tên đăng nhập phải có ít nhất 3 ký tự , tối đa 20 ký tự',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới',
  })
  username: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @Matches(/^0[0-9]{9,10}$/, {
    message: 'Số điện thoại phải bắt đầu bằng số 0 và có 10-11 chữ số',
  })
  phone?: string;

  @IsEnum(['teacher', 'admin', 'center_owner'])
  role: string;

  @IsOptional()
  @IsArray()
  subjects?: string[];

  @IsOptional()
  @IsDateString()
  contractEnd?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // Thêm các field mới cho trường học và ảnh hợp đồng
  @IsOptional()
  @IsString()
  schoolName?: string;

  @IsOptional()
  @IsString()
  schoolAddress?: string;

  // contractImage sẽ được xử lý riêng trong service (File hoặc string)
  contractImage?: any;

  // contractImageUrl từ Excel import hoặc từ Cloudinary
  @IsOptional()
  @IsString()
  contractImageUrl?: string;
}
