import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateLeaveRequestDto {
  @IsString()
  @IsOptional()
  requestType?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
