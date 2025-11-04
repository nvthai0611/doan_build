export declare class UserInfoDto {
    id: string;
    username: string;
    email: string;
    fullName?: string;
    phone?: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SubjectInfoDto {
    id: string;
    code: string;
    name: string;
    description?: string;
}
export declare class RoomInfoDto {
    id: string;
    name: string;
    capacity?: number;
    equipment?: any;
    isActive: boolean;
}
export declare class StudentInfoDto {
    id: string;
    studentCode?: string;
    grade?: string;
    user: {
        fullName?: string;
        email: string;
        phone?: string;
    };
}
export declare class EnrollmentInfoDto {
    id: string;
    status: string;
    enrolledAt: Date;
    student: StudentInfoDto;
}
export declare class ClassInfoDto {
    id: string;
    name: string;
    grade?: string;
    maxStudents?: number;
    startDate?: Date;
    endDate?: Date;
    recurringSchedule?: any;
    status: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    subject: SubjectInfoDto;
    room?: RoomInfoDto;
    enrollments: EnrollmentInfoDto[];
    _count: {
        enrollments: number;
        sessions: number;
        assessments: number;
    };
}
export declare class ContractInfoDto {
    id: string;
    startDate?: Date;
    endDate?: Date;
    salary?: any;
    status: string;
    terms?: any;
    createdAt: Date;
}
export declare class PayrollInfoDto {
    id: string;
    periodStart: Date;
    periodEnd: Date;
    baseSalary: any;
    teachingHours?: any;
    hourlyRate?: any;
    bonuses: any;
    deductions: any;
    totalAmount: any;
    status: string;
    paidAt?: Date;
}
export declare class DocumentInfoDto {
    id: string;
    docType?: string;
    docUrl?: string;
    uploadedAt: Date;
}
export declare class LeaveRequestInfoDto {
    id: string;
    requestType: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: string;
    createdAt: Date;
    approvedAt?: Date;
}
export declare class TeacherCountDto {
    classes: number;
    contracts: number;
    payrolls: number;
    documents: number;
    leaveRequests: number;
}
export declare class TeacherDetailDto {
    id: string;
    userId: string;
    contractEnd?: Date;
    subjects: string[];
    salary?: any;
    createdAt: Date;
    updatedAt: Date;
    user: UserInfoDto;
    classes: ClassInfoDto[];
    contracts: ContractInfoDto[];
    payrolls: PayrollInfoDto[];
    documents: DocumentInfoDto[];
    leaveRequests: LeaveRequestInfoDto[];
    _count: TeacherCountDto;
}
export declare class TeachersListResponseDto {
    success: boolean;
    data: TeacherDetailDto[];
    total: number;
    message: string;
}
export declare class TeacherResponseDto {
    success: boolean;
    data: TeacherDetailDto;
    message: string;
}
