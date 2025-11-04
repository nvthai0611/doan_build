export declare class UserInfoDto {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
    gender?: string;
    birthDate?: Date;
    createdAt: Date;
}
export declare class SchoolInfoDto {
    id: string;
    name: string;
    address?: string;
    phone?: string;
}
export declare class ParentInfoDto {
    id: string;
    user: {
        fullName: string;
        email: string;
        phone?: string;
    };
}
export declare class SessionInfoDto {
    id: string;
    sessionDate: Date;
    startTime: string;
    endTime: string;
    status: string;
}
export declare class AttendanceInfoDto {
    id: string;
    status: string;
    note?: string;
    recordedAt: Date;
    session: SessionInfoDto;
}
export declare class AssessmentInfoDto {
    id: string;
    name: string;
    type: string;
    maxScore: number;
    date: Date;
}
export declare class GradeInfoDto {
    id: string;
    score?: number;
    feedback?: string;
    gradedAt: Date;
    assessment: AssessmentInfoDto;
}
export declare class SubjectInfoDto {
    id: string;
    name: string;
    code: string;
    description?: string;
}
export declare class ClassInfoDto {
    id: string;
    name: string;
    grade?: string;
    description?: string;
    subject: SubjectInfoDto;
}
export declare class TeacherInfoDto {
    id: string;
    user: {
        fullName: string;
        email: string;
        phone?: string;
    };
}
export declare class TeacherClassAssignmentDto {
    id: string;
    semester: string;
    academicYear: string;
    startDate: Date;
    endDate?: Date;
    status: string;
    teacher: TeacherInfoDto;
}
export declare class StudentDetailInfoDto {
    id: string;
    studentCode?: string;
    address?: string;
    grade?: string;
    user: UserInfoDto;
    school: SchoolInfoDto;
    parent?: ParentInfoDto;
    attendances: AttendanceInfoDto[];
    grades: GradeInfoDto[];
}
export declare class StudentDetailEnrollmentDto {
    id: string;
    enrolledAt: Date;
    status: string;
    semester?: string;
    completedAt?: Date;
    finalGrade?: string;
    student: StudentDetailInfoDto;
    class: ClassInfoDto;
    teacherClassAssignment: TeacherClassAssignmentDto;
}
export declare class StudentDetailResponseDto {
    success: boolean;
    data?: StudentDetailEnrollmentDto;
    message: string;
}
