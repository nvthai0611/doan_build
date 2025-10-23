import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateHolidayDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


