import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export enum AlertType {
  PARENT_REGISTRATION = 'parent_registration',
  LEAVE_REQUEST = 'leave_request',
  SESSION_REQUEST = 'session_request',
  INCIDENT_REPORT = 'incident_report',
  ENROLLMENT = 'enrollment',
  PAYMENT = 'payment',
  OTHER = 'other',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class CreateAlertDto {
  @ApiProperty({ enum: AlertType, description: 'Loại cảnh báo' })
  @IsEnum(AlertType)
  @IsNotEmpty({ message: 'Loại cảnh báo không được để trống' })
  alertType: AlertType;

  @ApiProperty({ description: 'Tiêu đề cảnh báo' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @ApiProperty({ description: 'Nội dung cảnh báo' })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  message: string;

  @ApiProperty({ enum: AlertSeverity, description: 'Mức độ nghiêm trọng', required: false })
  @IsEnum(AlertSeverity)
  @IsOptional()
  severity?: AlertSeverity;

  @ApiProperty({ description: 'Dữ liệu bổ sung (JSON)', required: false })
  @IsOptional()
  payload?: any;
}

export class UpdateAlertDto {
  @ApiProperty({ description: 'Đánh dấu là đã đọc', required: false })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @ApiProperty({ description: 'Đánh dấu là đã xử lý', required: false })
  @IsBoolean()
  @IsOptional()
  processed?: boolean;
}

export class GetAlertsDto {
  @ApiProperty({ description: 'Số trang', required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Số lượng mỗi trang', required: false, default: 20 })
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: 'Lọc theo loại', required: false })
  @IsOptional()
  alertType?: string;

  @ApiProperty({ description: 'Lọc theo mức độ nghiêm trọng', required: false })
  @IsOptional()
  severity?: string;

  @ApiProperty({ description: 'Lọc đã đọc/chưa đọc', required: false })
  @IsOptional()
  isRead?: boolean;

  @ApiProperty({ description: 'Lọc đã xử lý/chưa xử lý', required: false })
  @IsOptional()
  processed?: boolean;
}

