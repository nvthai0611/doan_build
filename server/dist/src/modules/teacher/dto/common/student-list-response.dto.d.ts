export declare class UserInfoDto {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
    gender?: string;
    birthDate?: Date;
}
export declare class SchoolInfoDto {
    id: string;
    name: string;
}
export declare class SubjectInfoDto {
    id: string;
    name: string;
    code: string;
}
export declare class ClassInfoDto {
    id: string;
    name: string;
    grade?: string;
    subject: SubjectInfoDto;
}
export declare class TeacherInfoDto {
    id: string;
    user: {
        fullName: string;
        email: string;
    };
}
export declare class TeacherClassAssignmentDto {
    id: string;
    semester: string;
    academicYear: string;
    teacher: TeacherInfoDto;
}
export declare class StudentInfoDto {
    id: string;
    studentCode?: string;
    address?: string;
    grade?: string;
    user: UserInfoDto;
    school: SchoolInfoDto;
}
export declare class EnrollmentDto {
    id: string;
    enrolledAt: Date;
    status: string;
    semester?: string;
    completedAt?: Date;
    finalGrade?: string;
    student: StudentInfoDto;
    class: ClassInfoDto;
    teacherClassAssignment: TeacherClassAssignmentDto;
}
export declare class StudentListResponseDto {
    success: boolean;
    data: EnrollmentDto[];
    message: string;
}
