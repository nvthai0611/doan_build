import { IsOptional, IsString, IsDateString } from 'class-validator';

export class QueryScheduleDto {
  @IsOptional()
  @IsDateString()
  date?: string; // YYYY-MM-DD
}

export class QueryScheduleWeekDto {
  @IsDateString()
  startDate!: string; // YYYY-MM-DD

  @IsDateString()
  endDate!: string; // YYYY-MM-DD
}

export class QueryScheduleMonthDto {
  @IsString()
  month!: string; // "1"-"12"

  @IsString()
  year!: string; // "1970"-"3000"
}
