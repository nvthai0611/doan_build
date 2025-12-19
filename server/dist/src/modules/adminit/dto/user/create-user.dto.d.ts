import { Gender } from 'src/common/constants';
declare const USER_ROLE_VALUES: readonly ["admin", "center_owner", "teacher", "parent", "student"];
export type UserRoleType = (typeof USER_ROLE_VALUES)[number];
export declare class CreateUserDto {
    email: string;
    fullName: string;
    username: string;
    phone?: string;
    avatar?: string | null;
    role: UserRoleType;
    isActive?: boolean;
    password?: string;
    gender?: Gender;
    birthDate?: string | null;
    note?: string;
}
export {};
