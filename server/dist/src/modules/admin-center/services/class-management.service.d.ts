import { PrismaService } from '../../../db/prisma.service';
import { CreateClassDto } from '../dto/class/create-class.dto';
import { UpdateClassDto } from '../dto/class/update-class.dto';
import { QueryClassDto } from '../dto/class/query-class.dto';
import { EmailQueueService } from '../../shared/services/email-queue.service';
import { EmailNotificationService } from '../../shared/services/email-notification.service';
import { ClassStatus } from '../../../common/constants';
export declare class ClassManagementService {
    private prisma;
    private emailQueueService;
    private emailNotificationService;
    constructor(prisma: PrismaService, emailQueueService: EmailQueueService, emailNotificationService: EmailNotificationService);
    private suggestNextClassName;
    private checkDuplicateClassName;
    findAll(queryDto: QueryClassDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            code: string;
            subjectId: string;
            subjectName: string;
            gradeId: string;
            gradeName: string;
            gradeLevel: number;
            status: string;
            maxStudents: number;
            currentStudents: number;
            roomId: string;
            roomName: string;
            description: string;
            actualStartDate: Date;
            actualEndDate: Date;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue;
            academicYear: string;
            expectedStartDate: Date;
            teacher: {
                id: string;
                userId: string;
                name: string;
                email: string;
                phone: string;
                avatar: string;
            };
            sessions: number;
            sessionsEnd: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            subjectName: string;
            roomName: string;
            gradeName: string;
            gradeLevel: number;
            currentStudents: number;
            teacher: {
                teacherId: string;
                userId: string;
                teacherCode: string;
                id: string;
                email: string;
                fullName: string;
                avatar: string;
                phone: string;
            };
            students: {
                enrolledAt: Date;
                status: string;
                id: string;
                email: string;
                fullName: string;
                phone: string;
                enrollmentId: bigint;
                studentId: string;
            }[];
            grade: {
                level: number;
                id: string;
                description: string | null;
                name: string;
                isActive: boolean;
            };
            room: {
                createdAt: Date;
                id: string;
                name: string;
                isActive: boolean;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
            subject: {
                id: string;
                description: string | null;
                name: string;
                code: string;
            };
            enrollments: ({
                student: {
                    user: {
                        id: string;
                        email: string;
                        fullName: string;
                        phone: string;
                    };
                } & {
                    createdAt: Date;
                    id: string;
                    updatedAt: Date;
                    grade: string | null;
                    userId: string;
                    schoolId: string;
                    studentCode: string | null;
                    address: string | null;
                    parentId: string | null;
                    scholarshipId: string | null;
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
            _count: {
                enrollments: number;
            };
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            classCode: string | null;
            description: string | null;
            feeStructureId: string | null;
            gradeId: string | null;
            maxStudents: number | null;
            name: string;
            status: string;
            subjectId: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            academicYear: string | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            updatedAt: Date;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
            password: string | null;
        };
    }>;
    create(createClassDto: CreateClassDto): Promise<{
        success: boolean;
        message: string;
        data: {
            feeStructure: {
                createdAt: Date;
                id: string;
                description: string | null;
                gradeId: string | null;
                name: string;
                subjectId: string | null;
                isActive: boolean;
                amount: import("@prisma/client/runtime/library").Decimal;
                period: string;
            };
            grade: {
                level: number;
                id: string;
                description: string | null;
                name: string;
                isActive: boolean;
            };
            room: {
                createdAt: Date;
                id: string;
                name: string;
                isActive: boolean;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
            subject: {
                id: string;
                description: string | null;
                name: string;
                code: string;
            };
            teacher: {
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                    avatar: string;
                    phone: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                teacherCode: string;
                schoolId: string | null;
                subjects: string[];
            };
        } & {
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            classCode: string | null;
            description: string | null;
            feeStructureId: string | null;
            gradeId: string | null;
            maxStudents: number | null;
            name: string;
            status: string;
            subjectId: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            academicYear: string | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            updatedAt: Date;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
            password: string | null;
        };
    }>;
    update(id: string, updateClassDto: UpdateClassDto): Promise<{
        success: boolean;
        message: string;
        data: {
            grade: {
                level: number;
                id: string;
                description: string | null;
                name: string;
                isActive: boolean;
            };
            room: {
                createdAt: Date;
                id: string;
                name: string;
                isActive: boolean;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
            subject: {
                id: string;
                description: string | null;
                name: string;
                code: string;
            };
            teacher: {
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                    avatar: string;
                    phone: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                teacherCode: string;
                schoolId: string | null;
                subjects: string[];
            };
        } & {
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            classCode: string | null;
            description: string | null;
            feeStructureId: string | null;
            gradeId: string | null;
            maxStudents: number | null;
            name: string;
            status: string;
            subjectId: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            academicYear: string | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            updatedAt: Date;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
            password: string | null;
        };
        sessionsGenerated: boolean;
        warning?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            grade: {
                level: number;
                id: string;
                description: string | null;
                name: string;
                isActive: boolean;
            };
            room: {
                createdAt: Date;
                id: string;
                name: string;
                isActive: boolean;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
            subject: {
                id: string;
                description: string | null;
                name: string;
                code: string;
            };
            teacher: {
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                    avatar: string;
                    phone: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                teacherCode: string;
                schoolId: string | null;
                subjects: string[];
            };
        } & {
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            classCode: string | null;
            description: string | null;
            feeStructureId: string | null;
            gradeId: string | null;
            maxStudents: number | null;
            name: string;
            status: string;
            subjectId: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            academicYear: string | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            updatedAt: Date;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
            password: string | null;
        };
        warning: any;
        sessionsGenerated?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            grade: {
                level: number;
                id: string;
                description: string | null;
                name: string;
                isActive: boolean;
            };
            room: {
                createdAt: Date;
                id: string;
                name: string;
                isActive: boolean;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
            subject: {
                id: string;
                description: string | null;
                name: string;
                code: string;
            };
            teacher: {
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                    avatar: string;
                    phone: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                teacherCode: string;
                schoolId: string | null;
                subjects: string[];
            };
        } & {
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            classCode: string | null;
            description: string | null;
            feeStructureId: string | null;
            gradeId: string | null;
            maxStudents: number | null;
            name: string;
            status: string;
            subjectId: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            academicYear: string | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            updatedAt: Date;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
            password: string | null;
        };
        sessionsGenerated?: undefined;
        warning?: undefined;
    }>;
    updateStatus(id: string, updateStatusDto: {
        status: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            classCode: string | null;
            description: string | null;
            feeStructureId: string | null;
            gradeId: string | null;
            maxStudents: number | null;
            name: string;
            status: string;
            subjectId: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            academicYear: string | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            updatedAt: Date;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
            password: string | null;
        };
        updatedEnrollmentsCount: number;
        sessionsGenerated: boolean;
        warning?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            classCode: string | null;
            description: string | null;
            feeStructureId: string | null;
            gradeId: string | null;
            maxStudents: number | null;
            name: string;
            status: string;
            subjectId: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            academicYear: string | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            updatedAt: Date;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
            password: string | null;
        };
        updatedEnrollmentsCount: number;
        warning: any;
        sessionsGenerated?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            classCode: string | null;
            description: string | null;
            feeStructureId: string | null;
            gradeId: string | null;
            maxStudents: number | null;
            name: string;
            status: string;
            subjectId: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            academicYear: string | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            updatedAt: Date;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
            password: string | null;
        };
        updatedEnrollmentsCount: number;
        sessionsGenerated?: undefined;
        warning?: undefined;
    }>;
    generateSessions(classId: string, body: any): Promise<{
        success: boolean;
        data: {
            createdCount: number;
            totalSessions: number;
            filteredCount: number;
            skippedCount: number;
            startDate: Date;
            endDate: Date;
            sessions: {
                classId: string;
                academicYear: string;
                sessionDate: Date;
                startTime: string;
                endTime: string;
                roomId: string | null;
                teacherId: string | null;
                status: string;
                notes: string;
                createdAt: Date;
            }[];
            validationPassed: boolean;
            updatedEnrollments: number;
            classInfo: {
                id: string;
                name: string;
                teacher: string;
                room: string;
                subject: string;
                activeEnrollments: number;
                status: string;
            };
        };
        message: string;
    }>;
    getClassSessions(classId: string, query: any): Promise<{
        success: boolean;
        data: {
            id: string;
            topic: string;
            name: string;
            scheduledDate: string;
            sessionDate: string;
            startTime: string;
            endTime: string;
            status: string;
            notes: string;
            teacher: string;
            teacherName: string;
            substituteTeacher: string;
            originalTeacher: string;
            isSubstitute: boolean;
            totalStudents: number;
            studentCount: number;
            attendanceCount: number;
            absentCount: number;
            notAttendedCount: number;
            rating: number;
            roomName: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        message: string;
    }>;
    deleteSessions(classId: string, sessionIds: string[]): Promise<{
        success: boolean;
        data: {
            deletedCount: number;
            requestedCount: number;
            classId: string;
            className: string;
        };
        message: string;
    }>;
    updateClassSchedules(id: string, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            feeStructure: {
                createdAt: Date;
                id: string;
                description: string | null;
                gradeId: string | null;
                name: string;
                subjectId: string | null;
                isActive: boolean;
                amount: import("@prisma/client/runtime/library").Decimal;
                period: string;
            };
            grade: {
                level: number;
                id: string;
                description: string | null;
                name: string;
                isActive: boolean;
            };
            room: {
                createdAt: Date;
                id: string;
                name: string;
                isActive: boolean;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
            subject: {
                id: string;
                description: string | null;
                name: string;
                code: string;
            };
            teacher: {
                user: {
                    id: string;
                    email: string;
                    fullName: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                teacherCode: string;
                schoolId: string | null;
                subjects: string[];
            };
        } & {
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            classCode: string | null;
            description: string | null;
            feeStructureId: string | null;
            gradeId: string | null;
            maxStudents: number | null;
            name: string;
            status: string;
            subjectId: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            academicYear: string | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            updatedAt: Date;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
            password: string | null;
        };
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    cloneClass(id: string, cloneData: any): Promise<{
        success: boolean;
        message: string;
        data: {
            gradeName: string;
            gradeLevel: number;
            subjectName: string;
            roomName: string;
            teacher: {
                id: string;
                name: string;
                email: string;
                phone: string;
            };
            grade: {
                level: number;
                id: string;
                description: string | null;
                name: string;
                isActive: boolean;
            };
            room: {
                createdAt: Date;
                id: string;
                name: string;
                isActive: boolean;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
            subject: {
                id: string;
                description: string | null;
                name: string;
                code: string;
            };
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            classCode: string | null;
            description: string | null;
            feeStructureId: string | null;
            gradeId: string | null;
            maxStudents: number | null;
            name: string;
            status: string;
            subjectId: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            academicYear: string | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            updatedAt: Date;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
            password: string | null;
        };
    }>;
    assignTeacher(classId: string, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            teacher: {
                user: {
                    email: string;
                    fullName: string;
                    avatar: string;
                    phone: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                teacherCode: string;
                schoolId: string | null;
                subjects: string[];
            };
        } & {
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            classCode: string | null;
            description: string | null;
            feeStructureId: string | null;
            gradeId: string | null;
            maxStudents: number | null;
            name: string;
            status: string;
            subjectId: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            academicYear: string | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            updatedAt: Date;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
            password: string | null;
        };
        metadata: {
            hasSchedule: true;
            statusChanged: boolean;
            oldStatus: string;
            newStatus: string;
        };
    }>;
    removeTeacher(classId: string, teacherId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            createdAt: Date;
            id: string;
            roomId: string | null;
            teacherId: string | null;
            classCode: string | null;
            description: string | null;
            feeStructureId: string | null;
            gradeId: string | null;
            maxStudents: number | null;
            name: string;
            status: string;
            subjectId: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
            academicYear: string | null;
            expectedStartDate: Date | null;
            actualStartDate: Date | null;
            actualEndDate: Date | null;
            updatedAt: Date;
            feeAmount: import("@prisma/client/runtime/library").Decimal | null;
            feePeriod: string | null;
            feeCurrency: string | null;
            feeLockedAt: Date | null;
            password: string | null;
        };
        metadata: {
            statusChanged: boolean;
            oldStatus: string;
            newStatus: ClassStatus;
        };
    }>;
    getTeachersByClass(classId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            fullName: string;
            avatar: string;
            phone: string;
            teacherId: string;
            userId: string;
        }[];
    }>;
    transferTeacher(classId: string, body: any, requestedBy: string): Promise<{
        success: boolean;
        message: string;
        data: {
            teacher: {
                user: {
                    email: string;
                    fullName: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                teacherCode: string;
                schoolId: string | null;
                subjects: string[];
            };
            fromClass: {
                id: string;
                name: string;
            };
            replacementTeacher: {
                user: {
                    email: string;
                    fullName: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                teacherCode: string;
                schoolId: string | null;
                subjects: string[];
            };
        } & {
            createdAt: Date;
            id: string;
            teacherId: string;
            status: string;
            updatedAt: Date;
            completedAt: Date | null;
            substituteEndDate: Date | null;
            notes: string | null;
            fromClassId: string | null;
            toClassId: string | null;
            replacementTeacherId: string | null;
            reason: string;
            reasonDetail: string | null;
            requestedBy: string;
            approvedBy: string | null;
            approvedAt: Date | null;
            effectiveDate: Date | null;
            feedbackSummary: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    validateTransferConflict(classId: string, params: {
        replacementTeacherId: string;
        effectiveDate?: string;
        substituteEndDate?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            hasConflict: boolean;
            conflicts: any[];
            incompatibleSubject: boolean;
            subjectMessage: string;
            inactive: boolean;
        };
    } | {
        success: boolean;
        message: string;
        data: {
            hasConflict: boolean;
            conflicts: any[];
            incompatibleSubject: boolean;
            subjectMessage: string;
            inactive?: undefined;
        };
    }>;
    getTransferRequests(params: any): Promise<{
        success: boolean;
        data: ({
            teacher: {
                user: {
                    email: string;
                    fullName: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                teacherCode: string;
                schoolId: string | null;
                subjects: string[];
            };
            fromClass: {
                id: string;
                name: string;
            };
            replacementTeacher: {
                user: {
                    email: string;
                    fullName: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                teacherCode: string;
                schoolId: string | null;
                subjects: string[];
            };
        } & {
            createdAt: Date;
            id: string;
            teacherId: string;
            status: string;
            updatedAt: Date;
            completedAt: Date | null;
            substituteEndDate: Date | null;
            notes: string | null;
            fromClassId: string | null;
            toClassId: string | null;
            replacementTeacherId: string | null;
            reason: string;
            reasonDetail: string | null;
            requestedBy: string;
            approvedBy: string | null;
            approvedAt: Date | null;
            effectiveDate: Date | null;
            feedbackSummary: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        meta: {
            total: number;
            page: any;
            limit: any;
            totalPages: number;
        };
        message: string;
    }>;
    approveTransfer(transferId: string, body: any, approvedBy: string): Promise<{
        success: boolean;
        message: string;
        data: {
            teacher: {
                user: {
                    email: string;
                    fullName: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                teacherCode: string;
                schoolId: string | null;
                subjects: string[];
            };
            fromClass: {
                id: string;
                name: string;
            };
            replacementTeacher: {
                user: {
                    email: string;
                    fullName: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                teacherCode: string;
                schoolId: string | null;
                subjects: string[];
            };
        } & {
            createdAt: Date;
            id: string;
            teacherId: string;
            status: string;
            updatedAt: Date;
            completedAt: Date | null;
            substituteEndDate: Date | null;
            notes: string | null;
            fromClassId: string | null;
            toClassId: string | null;
            replacementTeacherId: string | null;
            reason: string;
            reasonDetail: string | null;
            requestedBy: string;
            approvedBy: string | null;
            approvedAt: Date | null;
            effectiveDate: Date | null;
            feedbackSummary: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    rejectTransfer(transferId: string, body: any, rejectedBy: string): Promise<{
        success: boolean;
        message: string;
        data: {
            teacher: {
                user: {
                    email: string;
                    fullName: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                teacherCode: string;
                schoolId: string | null;
                subjects: string[];
            };
            fromClass: {
                id: string;
                name: string;
            };
            replacementTeacher: {
                user: {
                    email: string;
                    fullName: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                teacherCode: string;
                schoolId: string | null;
                subjects: string[];
            };
        } & {
            createdAt: Date;
            id: string;
            teacherId: string;
            status: string;
            updatedAt: Date;
            completedAt: Date | null;
            substituteEndDate: Date | null;
            notes: string | null;
            fromClassId: string | null;
            toClassId: string | null;
            replacementTeacherId: string | null;
            reason: string;
            reasonDetail: string | null;
            requestedBy: string;
            approvedBy: string | null;
            approvedAt: Date | null;
            effectiveDate: Date | null;
            feedbackSummary: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    getStats(classId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            totalStudents: number;
            activeStudents: number;
            completedStudents: number;
            withdrawnStudents: number;
            maxStudents: number;
            availableSlots: number;
        };
    }>;
    getDashboard(classId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            teachers: number;
            students: number;
            lessons: number;
            revenue: number | import("@prisma/client/runtime/library").Decimal;
            rating: number;
            reviews: number;
            attendance: {
                onTime: number;
                late: number;
                excusedAbsence: number;
                unexcusedAbsence: number;
                notMarked: number;
            };
            homework: {
                assigned: number;
                submitted: number;
                notSubmitted: number;
            };
        };
    }>;
    getClassByTeacherId(query: any, teacherId: string): Promise<{
        data: {
            id: string;
            code: string;
            name: string;
            subject: string;
            students: number;
            schedule: string[];
            status: string;
            startDate: string;
            endDate: string;
            room: string;
            description: string;
            teacherId: string;
            gradeName: string;
            feeStructureName: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        message: string;
    }>;
    getClassDetail(id: string): Promise<{
        id: string;
        code: string;
        name: string;
        subject: string;
        students: number;
        schedule: import("@prisma/client/runtime/library").JsonValue;
        status: string;
        startDate: string;
        endDate: string;
        room: string;
        description: string;
        teacherId: string;
        teacherName: string;
        gradeName: string;
        feeStructureName: string;
    }>;
    createClass(body: any): Promise<{
        createdAt: Date;
        id: string;
        roomId: string | null;
        teacherId: string | null;
        classCode: string | null;
        description: string | null;
        feeStructureId: string | null;
        gradeId: string | null;
        maxStudents: number | null;
        name: string;
        status: string;
        subjectId: string;
        recurringSchedule: import("@prisma/client/runtime/library").JsonValue | null;
        academicYear: string | null;
        expectedStartDate: Date | null;
        actualStartDate: Date | null;
        actualEndDate: Date | null;
        updatedAt: Date;
        feeAmount: import("@prisma/client/runtime/library").Decimal | null;
        feePeriod: string | null;
        feeCurrency: string | null;
        feeLockedAt: Date | null;
        password: string | null;
    }>;
    private isValidUUID;
    private checkTeacherScheduleConflict;
    private parseRecurringSchedule;
    private normalizeDayOfWeek;
    private isTimeOverlapping;
    private getDayName;
}
