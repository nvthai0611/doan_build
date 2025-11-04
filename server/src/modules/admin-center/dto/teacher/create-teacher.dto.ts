import { IsEmail, IsString, IsOptional, IsArray, IsDateString, IsEnum, IsBoolean, IsUUID } from 'class-validator';
import { Gender } from 'src/common/constants';

export class CreateTeacherDto {
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
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