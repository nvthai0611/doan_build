import { PrismaService } from '../../../db/prisma.service';
import { EmailNotificationService } from '../../shared/services/email-notification.service';
export declare class EnrollmentManagementService {
    private prisma;
    private emailNotificationService;
    constructor(prisma: PrismaService, emailNotificationService: EmailNotificationService);
    create(body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            class: {
                subject: {
                    id: string;
                    name: string;
                    description: string | null;
                    code: string;
                };
            } & {
                id: string;
                status: string;
                createdAt: Date;
                password: string | null;
                updatedAt: Date;
                name: string;
                roomId: string | null;
                teacherId: string | null;
                classCode: string | null;
                description: string | null;
                feeStructureId: string | null;
                gradeId: string | null;
                maxStudents: number | null;
                subjectId: string;
                recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                academicYear: string | null;
                expectedStartDate: Date | null;
                actualStartDate: Date | null;
                actualEndDate: Date | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                feePeriod: string | null;
                feeCurrency: string | null;
                feeLockedAt: Date | null;
            };
            student: {
                user: {
                    email: string;
                    fullName: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                studentCode: string | null;
                address: string | null;
                grade: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            };
        } & {
            id: bigint;
            studentId: string;
            classId: string;
            status: string;
            enrolledAt: Date;
            semester: string | null;
            completedAt: Date | null;
            finalGrade: string | null;
            completionStatus: string | null;
            completionNotes: string | null;
        };
    }>;
    bulkEnroll(body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            success: any[];
            failed: any[];
        };
    }>;
    findAll(query: any): Promise<{
        success: boolean;
        message: string;
        data: ({
            class: {
                room: {
                    id: string;
                    createdAt: Date;
                    isActive: boolean;
                    name: string;
                    capacity: number | null;
                    equipment: import("@prisma/client/runtime/library").JsonValue | null;
                };
                subject: {
                    id: string;
                    name: string;
                    description: string | null;
                    code: string;
                };
            } & {
                id: string;
                status: string;
                createdAt: Date;
                password: string | null;
                updatedAt: Date;
                name: string;
                roomId: string | null;
                teacherId: string | null;
                classCode: string | null;
                description: string | null;
                feeStructureId: string | null;
                gradeId: string | null;
                maxStudents: number | null;
                subjectId: string;
                recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                academicYear: string | null;
                expectedStartDate: Date | null;
                actualStartDate: Date | null;
                actualEndDate: Date | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                feePeriod: string | null;
                feeCurrency: string | null;
                feeLockedAt: Date | null;
            };
            student: {
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                    phone: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                studentCode: string | null;
                address: string | null;
                grade: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            };
        } & {
            id: bigint;
            studentId: string;
            classId: string;
            status: string;
            enrolledAt: Date;
            semester: string | null;
            completedAt: Date | null;
            finalGrade: string | null;
            completionStatus: string | null;
            completionNotes: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findByClass(classId: string, query?: any): Promise<{
        success: boolean;
        message: string;
        data: {
            classesRegistered: number;
            classesAttended: number;
            student: {
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                    isActive: boolean;
                    avatar: string;
                    phone: string;
                };
                parent: {
                    user: {
                        id: string;
                        createdAt: Date;
                        email: string | null;
                        password: string;
                        fullName: string | null;
                        isActive: boolean;
                        avatar: string | null;
                        phone: string | null;
                        role: string;
                        roleId: string | null;
                        updatedAt: Date;
                        username: string;
                        gender: import(".prisma/client").$Enums.Gender | null;
                        birthDate: Date | null;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    userId: string;
                    relationshipType: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                studentCode: string | null;
                address: string | null;
                grade: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            };
            id: bigint;
            studentId: string;
            classId: string;
            status: string;
            enrolledAt: Date;
            semester: string | null;
            completedAt: Date | null;
            finalGrade: string | null;
            completionStatus: string | null;
            completionNotes: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findByStudent(studentId: string): Promise<{
        success: boolean;
        message: string;
        data: ({
            class: {
                room: {
                    id: string;
                    createdAt: Date;
                    isActive: boolean;
                    name: string;
                    capacity: number | null;
                    equipment: import("@prisma/client/runtime/library").JsonValue | null;
                };
                subject: {
                    id: string;
                    name: string;
                    description: string | null;
                    code: string;
                };
            } & {
                id: string;
                status: string;
                createdAt: Date;
                password: string | null;
                updatedAt: Date;
                name: string;
                roomId: string | null;
                teacherId: string | null;
                classCode: string | null;
                description: string | null;
                feeStructureId: string | null;
                gradeId: string | null;
                maxStudents: number | null;
                subjectId: string;
                recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                academicYear: string | null;
                expectedStartDate: Date | null;
                actualStartDate: Date | null;
                actualEndDate: Date | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                feePeriod: string | null;
                feeCurrency: string | null;
                feeLockedAt: Date | null;
            };
        } & {
            id: bigint;
            studentId: string;
            classId: string;
            status: string;
            enrolledAt: Date;
            semester: string | null;
            completedAt: Date | null;
            finalGrade: string | null;
            completionStatus: string | null;
            completionNotes: string | null;
        })[];
    }>;
    updateStatus(id: string, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: bigint;
            studentId: string;
            classId: string;
            status: string;
            enrolledAt: Date;
            semester: string | null;
            completedAt: Date | null;
            finalGrade: string | null;
            completionStatus: string | null;
            completionNotes: string | null;
        };
    }>;
    transfer(id: string, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            oldEnrollment: {
                class: {
                    id: string;
                    status: string;
                    createdAt: Date;
                    password: string | null;
                    updatedAt: Date;
                    name: string;
                    roomId: string | null;
                    teacherId: string | null;
                    classCode: string | null;
                    description: string | null;
                    feeStructureId: string | null;
                    gradeId: string | null;
                    maxStudents: number | null;
                    subjectId: string;
                    recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                    academicYear: string | null;
                    expectedStartDate: Date | null;
                    actualStartDate: Date | null;
                    actualEndDate: Date | null;
                    feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                    feePeriod: string | null;
                    feeCurrency: string | null;
                    feeLockedAt: Date | null;
                };
            } & {
                id: bigint;
                studentId: string;
                classId: string;
                status: string;
                enrolledAt: Date;
                semester: string | null;
                completedAt: Date | null;
                finalGrade: string | null;
                completionStatus: string | null;
                completionNotes: string | null;
            };
            newEnrollment: {
                id: bigint;
                studentId: string;
                classId: string;
                status: string;
                enrolledAt: Date;
                semester: string | null;
                completedAt: Date | null;
                finalGrade: string | null;
                completionStatus: string | null;
                completionNotes: string | null;
            };
        };
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    checkCapacity(classId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            maxStudents: number;
            currentStudents: number;
            availableSlots: number;
            isFull: boolean;
        };
    }>;
    getAvailableStudents(classId: string, query?: any): Promise<{
        success: boolean;
        message: string;
        data: ({
            user: {
                id: string;
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
            };
            parent: {
                user: {
                    email: string;
                    fullName: string;
                    phone: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                relationshipType: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            studentCode: string | null;
            address: string | null;
            grade: string | null;
            schoolId: string;
            parentId: string | null;
            scholarshipId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
