import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export const AUDIT_ACTION_FILTER = [
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'all',
] as const;

export const AUDIT_SORT_FIELDS = ['timestamp', 'action', 'tableName'] as const;

export type AuditActionFilter = (typeof AUDIT_ACTION_FILTER)[number];
export type AuditSortField = (typeof AUDIT_SORT_FIELDS)[number];

export class QueryAuditLogDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(AUDIT_ACTION_FILTER, { message: 'Hành động lọc không hợp lệ' })
  action?: AuditActionFilter;

  @IsOptional()
  @IsString()
  tableName?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  recordId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ' })
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  @IsIn(AUDIT_SORT_FIELDS, { message: 'Trường sắp xếp không hợp lệ' })
  sortBy?: AuditSortField;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'], { message: 'Thứ tự sắp xếp không hợp lệ' })
  sortOrder?: 'asc' | 'desc';
}

