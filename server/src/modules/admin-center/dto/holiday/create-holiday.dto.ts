import { IsBoolean, IsDateString, IsOptional, IsString, IsNotEmpty, MaxLength, IsIn } from 'class-validator';
import { Transform, Expose } from 'class-transformer';
import { IsDateRange, IsEndDateAfterStart } from '../../../../common/validators/date-range.validator';

export class CreateHolidayDto {
  @Expose()
  @IsNotEmpty({ message: 'Loại kỳ nghỉ không được để trống' })
  @IsString({ message: 'Loại kỳ nghỉ phải là chuỗi ký tự' })
  @IsIn(['PUBLIC', 'CENTER', 'EMERGENCY'], { message: 'Loại kỳ nghỉ phải là PUBLIC, CENTER hoặc EMERGENCY' })
  type!: string;

  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @IsDateString({}, { message: 'Ngày bắt đầu phải có định dạng ngày hợp lệ' })
  @IsDateRange({ message: 'Ngày bắt đầu không hợp lệ' })
  @Transform(({ value }) => {
    if (value) {
      const date = new Date(value);
      return date.toISOString().split('T')[0];
    }
    return value;
  })
  startDate!: string;

  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @IsDateString({}, { message: 'Ngày kết thúc phải có định dạng ngày hợp lệ' })
  @IsEndDateAfterStart({ message: 'Ngày kết thúc phải sau ngày bắt đầu' })
  @Transform(({ value }) => {
    if (value) {
      const date = new Date(value);
      return date.toISOString().split('T')[0];
    }
    return value;
  })
  endDate!: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự' })
  note?: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là true hoặc false' })
  isActive?: boolean;
}


