import { Gender } from 'src/common/constants';
export declare class CreateTeacherDto {
    email: string;
    fullName: string;
    username: string;
    phone?: string;
    role: string;
    subjects?: string[];
    contractEnd?: string;
    isActive?: boolean;
    gender?: Gender;
    birthDate?: string;
    notes?: string;
    schoolName?: string;
    schoolAddress?: string;
    contractImage?: any;
    contractImageUrl?: string;
}
