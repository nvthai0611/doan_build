import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  key: string;

  @IsString()
  group: string;

  @IsObject()
  value: any;

  @IsOptional()
  @IsString()
  description?: string;
}


