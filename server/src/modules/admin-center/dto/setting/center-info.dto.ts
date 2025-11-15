import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUrl,
  IsArray,
  ValidateNested,
  MaxLength,
  Matches,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class WorkingHourDto {
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @IsString({ message: 'Ngày bắt đầu phải là chuỗi ký tự' })
  fromDay!: string;

  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @IsString({ message: 'Ngày kết thúc phải là chuỗi ký tự' })
  toDay!: string;

  @IsNotEmpty({ message: 'Giờ mở cửa không được để trống' })
  @IsString({ message: 'Giờ mở cửa phải là chuỗi ký tự' })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Giờ mở cửa phải có định dạng HH:mm',
  })
  open!: string;

  @IsNotEmpty({ message: 'Giờ đóng cửa không được để trống' })
  @IsString({ message: 'Giờ đóng cửa phải là chuỗi ký tự' })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Giờ đóng cửa phải có định dạng HH:mm',
  })
  close!: string;
}

class CenterInfoDto {
  @IsNotEmpty({ message: 'Tên trung tâm không được để trống' })
  @IsString({ message: 'Tên trung tâm phải là chuỗi ký tự' })
  @MaxLength(200, { message: 'Tên trung tâm không được vượt quá 200 ký tự' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Logo phải là chuỗi ký tự' })
  logo?: string;

  @IsOptional()
  @IsString({ message: 'Banner phải là chuỗi ký tự' })
  banner?: string;

  @IsNotEmpty({ message: 'Mô tả ngắn không được để trống' })
  @IsString({ message: 'Mô tả ngắn phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Mô tả ngắn không được vượt quá 500 ký tự' })
  description!: string;

  @IsOptional()
  @IsString({ message: 'Slogan phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Slogan không được vượt quá 100 ký tự' })
  slogan?: string;
}

class ContactDto {
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @Matches(/^0\d{9,10}$/, {
    message: 'Số điện thoại phải bắt đầu bằng 0 và có 10-11 chữ số',
  })
  phone!: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsOptional()
  @IsUrl({}, { message: 'Website phải là URL hợp lệ' })
  website?: string;

  @IsNotEmpty({ message: 'Giờ làm việc không được để trống' })
  @IsArray({ message: 'Giờ làm việc phải là mảng' })
  @ValidateNested({ each: true })
  @Type(() => WorkingHourDto)
  workingHours!: WorkingHourDto[];
}

class AddressDto {
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @MaxLength(200, { message: 'Địa chỉ không được vượt quá 200 ký tự' })
  street!: string;

  @IsNotEmpty({ message: 'Tỉnh/Thành không được để trống' })
  @IsString({ message: 'Tỉnh/Thành phải là chuỗi ký tự' })
  province!: string;

  @IsNotEmpty({ message: 'Quận/Huyện không được để trống' })
  @IsString({ message: 'Quận/Huyện phải là chuỗi ký tự' })
  district!: string;

  @IsNotEmpty({ message: 'Địa chỉ chi tiết không được để trống' })
  @IsString({ message: 'Địa chỉ chi tiết phải là chuỗi ký tự' })
  @MaxLength(200, { message: 'Địa chỉ chi tiết không được vượt quá 200 ký tự' })
  detail!: string;
}

export class CenterInfoSettingDto {
  @IsNotEmpty({ message: 'Thông tin trung tâm không được để trống' })
  @ValidateNested()
  @Type(() => CenterInfoDto)
  centerInfo!: CenterInfoDto;

  @IsNotEmpty({ message: 'Thông tin liên hệ không được để trống' })
  @ValidateNested()
  @Type(() => ContactDto)
  contact!: ContactDto;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;
}

export class UpdateCenterInfoSettingDto {
  @IsNotEmpty({ message: 'Dữ liệu không được để trống' })
  @IsObject({ message: 'Dữ liệu phải là object' })
  @ValidateNested()
  @Type(() => CenterInfoSettingDto)
  value!: CenterInfoSettingDto;
}

