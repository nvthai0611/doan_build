import { IsNotEmpty, IsOptional, IsString, IsDateString, IsIn } from 'class-validator';

export class UpdateClassStatusDto {
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsString({ message: 'Trạng thái phải là chuỗi' })
  @IsIn(['draft', 'ready', 'active', 'completed', 'suspended', 'cancelled'], { message: 'Trạng thái không hợp lệ' })
  status: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
  endDate?: string;
}

