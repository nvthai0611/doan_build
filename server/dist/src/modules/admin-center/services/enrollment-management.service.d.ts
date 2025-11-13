import { PrismaService } from '../../../db/prisma.service';
import { EmailNotificationService } from '../../shared/services/email-notification.service';
export declare class EnrollmentManagementService {
    private prisma;
    private emailNotificationService;
    constructor(prisma: PrismaService, emailNotificationService: EmailNotificationService);
    private checkScheduleConflicts;
    private normalizeScheduleEntries;
    private parseScheduleInput;
    private normalizeScheduleDay;
    private extractScheduleTime;
    private getDayLabelFromKey;
    private areTimeRangesOverlapping;
    private convertTimeStringToMinutes;
    create(body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            student: {
                user: {
                    fullName: string;
                    email: string;
                };
            } & {
                createdAt: Date;
                grade: string | null;
                id: string;
                parentId: string | null;
                updatedAt: Date;
                userId: string;
                studentCode: string | null;
                address: string | null;
                schoolId: string;
                scholarshipId: string | null;
            };
            class: {
                subject: {
                    name: string;
                    description: string | null;
                    id: string;
                    code: string;
                };
            } & {
                name: string;
                description: string | null;
                password: string | null;
                status: string;
                gradeId: string | null;
                subjectId: string;
                roomId: string | null;
                teacherId: string | null;
                feeStructureId: string | null;
                createdAt: Date;
                academicYear: string | null;
                id: string;
                updatedAt: Date;
                classCode: string | null;
                maxStudents: number | null;
                recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                expectedStartDate: Date | null;
                actualStartDate: Date | null;
                actualEndDate: Date | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                feePeriod: string | null;
                feeCurrency: string | null;
                feeLockedAt: Date | null;
            };
        } & {
            status: string;
            id: bigint;
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
                    fullName: string;
                    email: string;
                    phone: string;
                    id: string;
                };
            } & {
                createdAt: Date;
                grade: string | null;
                id: string;
                parentId: string | null;
                updatedAt: Date;
                userId: string;
                studentCode: string | null;
                address: string | null;
                schoolId: string;
                scholarshipId: string | null;
            };
            class: {
                subject: {
                    name: string;
                    description: string | null;
                    id: string;
                    code: string;
                };
                room: {
                    name: string;
                    createdAt: Date;
                    id: string;
                    isActive: boolean;
                    capacity: number | null;
                    equipment: import("@prisma/client/runtime/library").JsonValue | null;
                };
            } & {
                name: string;
                description: string | null;
                password: string | null;
                status: string;
                gradeId: string | null;
                subjectId: string;
                roomId: string | null;
                teacherId: string | null;
                feeStructureId: string | null;
                createdAt: Date;
                academicYear: string | null;
                id: string;
                updatedAt: Date;
                classCode: string | null;
                maxStudents: number | null;
                recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                expectedStartDate: Date | null;
                actualStartDate: Date | null;
                actualEndDate: Date | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                feePeriod: string | null;
                feeCurrency: string | null;
                feeLockedAt: Date | null;
            };
        } & {
            status: string;
            id: bigint;
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
            hasContract: boolean;
            student: {
                user: {
                    fullName: string;
                    email: string;
                    phone: string;
                    id: string;
                    isActive: boolean;
                    avatar: string;
                };
                parent: {
                    user: {
                        fullName: string | null;
                        gender: import(".prisma/client").$Enums.Gender | null;
                        username: string;
                        email: string | null;
                        password: string;
                        phone: string | null;
                        birthDate: Date | null;
                        createdAt: Date;
                        role: string;
                        id: string;
                        updatedAt: Date;
                        isActive: boolean;
                        avatar: string | null;
                        roleId: string | null;
                    };
                } & {
                    relationshipType: string | null;
                    createdAt: Date;
                    id: string;
                    updatedAt: Date;
                    userId: string;
                };
            } & {
                createdAt: Date;
                grade: string | null;
                id: string;
                parentId: string | null;
                updatedAt: Date;
                userId: string;
                studentCode: string | null;
                address: string | null;
                schoolId: string;
                scholarshipId: string | null;
            };
            contractUploads: {
                status: string;
                id: string;
                uploadedAt: Date;
                subjectIds: string[];
            }[];
            status: string;
            id: bigint;
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
                    name: string;
                    description: string | null;
                    id: string;
                    code: string;
                };
                room: {
                    name: string;
                    createdAt: Date;
                    id: string;
                    isActive: boolean;
                    capacity: number | null;
                    equipment: import("@prisma/client/runtime/library").JsonValue | null;
                };
            } & {
                name: string;
                description: string | null;
                password: string | null;
                status: string;
                gradeId: string | null;
                subjectId: string;
                roomId: string | null;
                teacherId: string | null;
                feeStructureId: string | null;
                createdAt: Date;
                academicYear: string | null;
                id: string;
                updatedAt: Date;
                classCode: string | null;
                maxStudents: number | null;
                recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                expectedStartDate: Date | null;
                actualStartDate: Date | null;
                actualEndDate: Date | null;
                feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                feePeriod: string | null;
                feeCurrency: string | null;
                feeLockedAt: Date | null;
            };
        } & {
            status: string;
            id: bigint;
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
            status: string;
            id: bigint;
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
                student: {
                    user: {
                        fullName: string;
                    };
                    parent: {
                        user: {
                            fullName: string;
                            email: string;
                        };
                    } & {
                        relationshipType: string | null;
                        createdAt: Date;
                        id: string;
                        updatedAt: Date;
                        userId: string;
                    };
                } & {
                    createdAt: Date;
                    grade: string | null;
                    id: string;
                    parentId: string | null;
                    updatedAt: Date;
                    userId: string;
                    studentCode: string | null;
                    address: string | null;
                    schoolId: string;
                    scholarshipId: string | null;
                };
                class: {
                    name: string;
                    description: string | null;
                    password: string | null;
                    status: string;
                    gradeId: string | null;
                    subjectId: string;
                    roomId: string | null;
                    teacherId: string | null;
                    feeStructureId: string | null;
                    createdAt: Date;
                    academicYear: string | null;
                    id: string;
                    updatedAt: Date;
                    classCode: string | null;
                    maxStudents: number | null;
                    recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
                    expectedStartDate: Date | null;
                    actualStartDate: Date | null;
                    actualEndDate: Date | null;
                    feeAmount: import("@prisma/client/runtime/library").Decimal | null;
                    feePeriod: string | null;
                    feeCurrency: string | null;
                    feeLockedAt: Date | null;
                };
            } & {
                status: string;
                id: bigint;
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
                status: string;
                id: bigint;
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
            user: {
                fullName: string;
                email: string;
                phone: string;
                id: string;
                isActive: boolean;
                avatar: string;
            };
            parent: {
                user: {
                    fullName: string;
                    email: string;
                    phone: string;
                };
            } & {
                relationshipType: string | null;
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
            };
        } & {
            createdAt: Date;
            grade: string | null;
            id: string;
            parentId: string | null;
            updatedAt: Date;
            userId: string;
            studentCode: string | null;
            address: string | null;
            schoolId: string;
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
