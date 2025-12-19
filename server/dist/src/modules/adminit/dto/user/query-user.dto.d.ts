import { Gender } from 'src/common/constants';
export declare const USER_ROLES_FILTER: readonly ["admin", "center_owner", "teacher", "parent", "student"];
export declare const USER_STATUS_FILTER: readonly ["all", "active", "inactive"];
export declare const USER_SORT_FIELDS: readonly ["createdAt", "fullName", "username", "role"];
export type UserRoleFilter = (typeof USER_ROLES_FILTER)[number];
export type UserStatusFilter = (typeof USER_STATUS_FILTER)[number];
export type UserSortField = (typeof USER_SORT_FIELDS)[number];
export declare class QueryUserDto {
    search?: string;
    gender?: Gender;
    status?: UserStatusFilter;
    role?: UserRoleFilter | 'all';
    roles?: UserRoleFilter[];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: UserSortField;
    sortOrder?: 'asc' | 'desc';
    includeRelations?: boolean;
}
