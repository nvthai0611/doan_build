import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateHolidayDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


