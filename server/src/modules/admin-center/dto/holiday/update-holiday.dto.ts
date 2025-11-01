import { IsBoolean, IsDateString, IsOptional, IsString, MaxLength, IsIn } from 'class-validator';
import { Transform, Expose } from 'class-transformer';

export class UpdateHolidayDto {
  @Expose()
  @IsOptional()
  @IsString({ message: 'Loại kỳ nghỉ phải là chuỗi ký tự' })
  @IsIn(['PUBLIC', 'CENTER', 'EMERGENCY'], { message: 'Loại kỳ nghỉ phải là PUBLIC, CENTER hoặc EMERGENCY' })
  type?: string;

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


