import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { Gender } from 'src/common/constants';

export const USER_ROLES_FILTER = [
  'admin',
  'manager',
  'center_owner',
  'teacher',
  'parent',
  'student',
  'staff',
] as const;

export const USER_STATUS_FILTER = ['all', 'active', 'inactive'] as const;

export const USER_SORT_FIELDS = ['createdAt', 'fullName', 'username', 'role'] as const;

export type UserRoleFilter = (typeof USER_ROLES_FILTER)[number];
export type UserStatusFilter = (typeof USER_STATUS_FILTER)[number];
export type UserSortField = (typeof USER_SORT_FIELDS)[number];

export class QueryUserDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'Giới tính không hợp lệ' })
  gender?: Gender;

  @IsOptional()
  @IsString()
  @IsIn(USER_STATUS_FILTER, { message: 'Trạng thái lọc không hợp lệ' })
  status?: UserStatusFilter;

  @IsOptional()
  @IsString()
  @IsIn([...USER_ROLES_FILTER, 'all'], { message: 'Vai trò lọc không hợp lệ' })
  role?: UserRoleFilter | 'all';

  @IsOptional()
  @IsArray()
  @IsIn(USER_ROLES_FILTER, { each: true, message: 'Danh sách vai trò không hợp lệ' })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map((item) => item.trim());
    return undefined;
  })
  roles?: UserRoleFilter[];

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
  @IsIn(USER_SORT_FIELDS, { message: 'Trường sắp xếp không hợp lệ' })
  sortBy?: UserSortField;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'], { message: 'Thứ tự sắp xếp không hợp lệ' })
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @ValidateIf((value) => value !== undefined)
  @IsBoolean()
  includeRelations?: boolean;
}

