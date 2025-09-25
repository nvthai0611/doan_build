import { IsEmail, IsString, IsOptional, IsArray, IsDateString, IsEnum, IsBoolean, IsUUID } from 'class-validator';

export class CreateTeacherDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

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
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsDateString()
  contractEnd?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @IsOptional()
  salary?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}