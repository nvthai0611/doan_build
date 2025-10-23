import { IsBoolean, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateHolidayDto {
  @IsOptional()
  @IsDateString({}, { message: 'Ngày bắt đầu phải có định dạng ngày hợp lệ' })
  @Transform(({ value }) => {
    if (value) {
      const date = new Date(value);
      return date.toISOString().split('T')[0];
    }
    return value;
  })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc phải có định dạng ngày hợp lệ' })
  @Transform(({ value }) => {
    if (value) {
      const date = new Date(value);
      return date.toISOString().split('T')[0];
    }
    return value;
  })
  endDate?: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự' })
  note?: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là true hoặc false' })
  isActive?: boolean;
}


