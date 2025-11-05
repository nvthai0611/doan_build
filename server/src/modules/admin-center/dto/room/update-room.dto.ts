import { IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number | null;

  @IsOptional()
  @IsArray()
  equipment?: string[] | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

