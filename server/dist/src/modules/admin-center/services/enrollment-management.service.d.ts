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
            student: {
                user: {
                    email: string;
                    fullName: string;
                };
            } & {
                grade: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                studentCode: string | null;
                address: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            };
            class: {
                subject: {
                    id: string;
                    name: string;
                    description: string | null;
                    code: string;
                };
            } & {
                academicYear: string | null;
                password: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: string;
                name: string;
                description: string | null;
                subjectId: string;
                gradeId: string | null;
                maxStudents: number | null;
                roomId: string | null;
                teacherId: string | null;
                status: string;
                recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                expectedStartDate: Date | null;
                actualStartDate: Date | null;
                actualEndDate: Date | null;
                feeStructureId: string | null;
                classCode: string | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                feePeriod: string | null;
                feeCurrency: string | null;
                feeLockedAt: Date | null;
            };
        } & {
            id: bigint;
            status: string;
            studentId: string;
            classId: string;
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
            student: {
                user: {
                    email: string;
                    fullName: string;
                    phone: string;
                    id: string;
                };
            } & {
                grade: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                studentCode: string | null;
                address: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            };
            class: {
                subject: {
                    id: string;
                    name: string;
                    description: string | null;
                    code: string;
                };
                room: {
                    createdAt: Date;
                    isActive: boolean;
                    id: string;
                    name: string;
                    capacity: number | null;
                    equipment: import("@prisma/client/runtime/library").JsonValue | null;
                };
            } & {
                academicYear: string | null;
                password: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: string;
                name: string;
                description: string | null;
                subjectId: string;
                gradeId: string | null;
                maxStudents: number | null;
                roomId: string | null;
                teacherId: string | null;
                status: string;
                recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                expectedStartDate: Date | null;
                actualStartDate: Date | null;
                actualEndDate: Date | null;
                feeStructureId: string | null;
                classCode: string | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                feePeriod: string | null;
                feeCurrency: string | null;
                feeLockedAt: Date | null;
            };
        } & {
            id: bigint;
            status: string;
            studentId: string;
            classId: string;
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
                parent: {
                    user: {
                        role: string;
                        email: string | null;
                        password: string;
                        createdAt: Date;
                        fullName: string | null;
                        isActive: boolean;
                        avatar: string | null;
                        phone: string | null;
                        roleId: string | null;
                        updatedAt: Date;
                        username: string;
                        id: string;
                        gender: import(".prisma/client").$Enums.Gender | null;
                        birthDate: Date | null;
                    };
                } & {
                    createdAt: Date;
                    updatedAt: Date;
                    id: string;
                    userId: string;
                    relationshipType: string | null;
                };
                user: {
                    email: string;
                    fullName: string;
                    isActive: boolean;
                    avatar: string;
                    phone: string;
                    id: string;
                };
            } & {
                grade: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                studentCode: string | null;
                address: string | null;
                schoolId: string;
                parentId: string | null;
                scholarshipId: string | null;
            };
            id: bigint;
            status: string;
            studentId: string;
            classId: string;
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
                subject: {
                    id: string;
                    name: string;
                    description: string | null;
                    code: string;
                };
                room: {
                    createdAt: Date;
                    isActive: boolean;
                    id: string;
                    name: string;
                    capacity: number | null;
                    equipment: import("@prisma/client/runtime/library").JsonValue | null;
                };
            } & {
                academicYear: string | null;
                password: string | null;
                createdAt: Date;
                updatedAt: Date;
                id: string;
                name: string;
                description: string | null;
                subjectId: string;
                gradeId: string | null;
                maxStudents: number | null;
                roomId: string | null;
                teacherId: string | null;
                status: string;
                recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                expectedStartDate: Date | null;
                actualStartDate: Date | null;
                actualEndDate: Date | null;
                feeStructureId: string | null;
                classCode: string | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                feePeriod: string | null;
                feeCurrency: string | null;
                feeLockedAt: Date | null;
            };
        } & {
            id: bigint;
            status: string;
            studentId: string;
            classId: string;
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
            status: string;
            studentId: string;
            classId: string;
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
                    academicYear: string | null;
                    password: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    id: string;
                    name: string;
                    description: string | null;
                    subjectId: string;
                    gradeId: string | null;
                    maxStudents: number | null;
                    roomId: string | null;
                    teacherId: string | null;
                    status: string;
                    recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                    expectedStartDate: Date | null;
                    actualStartDate: Date | null;
                    actualEndDate: Date | null;
                    feeStructureId: string | null;
                    classCode: string | null;
                    feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                    feePeriod: string | null;
                    feeCurrency: string | null;
                    feeLockedAt: Date | null;
                };
            } & {
                id: bigint;
                status: string;
                studentId: string;
                classId: string;
                enrolledAt: Date;
                semester: string | null;
                completedAt: Date | null;
                finalGrade: string | null;
                completionStatus: string | null;
                completionNotes: string | null;
            };
            newEnrollment: {
                id: bigint;
                status: string;
                studentId: string;
                classId: string;
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
            parent: {
                user: {
                    email: string;
                    fullName: string;
                    phone: string;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                relationshipType: string | null;
            };
            user: {
                email: string;
                fullName: string;
                isActive: boolean;
                avatar: string;
                phone: string;
                id: string;
            };
        } & {
            grade: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            userId: string;
            studentCode: string | null;
            address: string | null;
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
