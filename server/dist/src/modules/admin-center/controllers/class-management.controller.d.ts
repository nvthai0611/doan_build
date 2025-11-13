import { ClassManagementService } from '../services/class-management.service';
import { CreateClassDto } from '../dto/class/create-class.dto';
import { UpdateClassDto } from '../dto/class/update-class.dto';
import { UpdateClassStatusDto } from '../dto/class/update-class-status.dto';
import { QueryClassDto } from '../dto/class/query-class.dto';
export declare class ClassManagementController {
    private readonly classManagementService;
    constructor(classManagementService: ClassManagementService);
    create(createClassDto: CreateClassDto): Promise<{
        success: boolean;
        message: string;
        data: {
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                    phone: string;
                    id: string;
                    avatar: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            subject: {
                name: string;
                description: string | null;
                id: string;
                code: string;
            };
            grade: {
                name: string;
                description: string | null;
                level: number;
                id: string;
                isActive: boolean;
            };
            room: {
                name: string;
                createdAt: Date;
                id: string;
                isActive: boolean;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
            feeStructure: {
                name: string;
                description: string | null;
                gradeId: string | null;
                subjectId: string | null;
                createdAt: Date;
                id: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                isActive: boolean;
                period: string;
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
    }>;
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
    getClassesForTransfer(queryDto: QueryClassDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            code: string;
            status: string;
            subjectId: string;
            subjectName: string;
            gradeId: string;
            gradeName: string;
            gradeLevel: number;
            roomId: string;
            roomName: string;
            teacherId: string;
            teacherName: string;
            teacherEmail: string;
            teacherPhone: string;
            teacherAvatar: string;
            teacher: {
                id: string;
                userId: string;
                name: string;
                email: string;
                phone: string;
                avatar: string;
            };
            maxStudents: number;
            currentStudents: number;
            expectedStartDate: Date;
            actualStartDate: Date;
            actualEndDate: Date;
            academicYear: string;
            recurringSchedule: import("@prisma/client/runtime/library").JsonValue;
            description: string;
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
                fullName: string;
                email: string;
                phone: string;
                id: string;
                avatar: string;
            };
            students: {
                enrolledAt: Date;
                status: string;
                fullName: string;
                email: string;
                phone: string;
                id: string;
                enrollmentId: bigint;
                studentId: string;
            }[];
            subject: {
                name: string;
                description: string | null;
                id: string;
                code: string;
            };
            grade: {
                name: string;
                description: string | null;
                level: number;
                id: string;
                isActive: boolean;
            };
            room: {
                name: string;
                createdAt: Date;
                id: string;
                isActive: boolean;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
            _count: {
                enrollments: number;
            };
            enrollments: ({
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
    }>;
    update(id: string, updateClassDto: UpdateClassDto): Promise<{
        success: boolean;
        message: string;
        data: {
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                    phone: string;
                    id: string;
                    avatar: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            subject: {
                name: string;
                description: string | null;
                id: string;
                code: string;
            };
            grade: {
                name: string;
                description: string | null;
                level: number;
                id: string;
                isActive: boolean;
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
        sessionsGenerated: boolean;
        warning?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                    phone: string;
                    id: string;
                    avatar: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            subject: {
                name: string;
                description: string | null;
                id: string;
                code: string;
            };
            grade: {
                name: string;
                description: string | null;
                level: number;
                id: string;
                isActive: boolean;
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
        warning: any;
        sessionsGenerated?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                    phone: string;
                    id: string;
                    avatar: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            subject: {
                name: string;
                description: string | null;
                id: string;
                code: string;
            };
            grade: {
                name: string;
                description: string | null;
                level: number;
                id: string;
                isActive: boolean;
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
        sessionsGenerated?: undefined;
        warning?: undefined;
    }>;
    updateStatus(id: string, updateClassStatusDto: UpdateClassStatusDto): Promise<{
        success: boolean;
        message: string;
        data: {
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
        updatedEnrollmentsCount: number;
        sessionsGenerated: boolean;
        warning?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
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
        updatedEnrollmentsCount: number;
        warning: any;
        sessionsGenerated?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
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
        updatedEnrollmentsCount: number;
        sessionsGenerated?: undefined;
        warning?: undefined;
    }>;
    updateClassSchedules(id: string, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                    id: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            subject: {
                name: string;
                description: string | null;
                id: string;
                code: string;
            };
            grade: {
                name: string;
                description: string | null;
                level: number;
                id: string;
                isActive: boolean;
            };
            room: {
                name: string;
                createdAt: Date;
                id: string;
                isActive: boolean;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
            feeStructure: {
                name: string;
                description: string | null;
                gradeId: string | null;
                subjectId: string | null;
                createdAt: Date;
                id: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                isActive: boolean;
                period: string;
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
    }>;
    delete(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    cloneClass(id: string, body: any): Promise<{
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
            subject: {
                name: string;
                description: string | null;
                id: string;
                code: string;
            };
            grade: {
                name: string;
                description: string | null;
                level: number;
                id: string;
                isActive: boolean;
            };
            room: {
                name: string;
                createdAt: Date;
                id: string;
                isActive: boolean;
                capacity: number | null;
                equipment: import("@prisma/client/runtime/library").JsonValue | null;
            };
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
    }>;
    assignTeacher(classId: string, body: any): Promise<{
        success: boolean;
        message: string;
        data: {
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                    phone: string;
                    avatar: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
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
        metadata: {
            hasSchedule: boolean;
            statusChanged: boolean;
            oldStatus: string;
            newStatus: string;
        };
    }>;
    removeTeacher(classId: string, teacherId: string): Promise<{
        success: boolean;
        message: string;
        data: {
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
        metadata: {
            statusChanged: boolean;
            oldStatus: string;
            newStatus: import("../../../common/constants").ClassStatus;
        };
    }>;
    getTeachersByClass(classId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            fullName: string;
            email: string;
            phone: string;
            id: string;
            avatar: string;
            teacherId: string;
            userId: string;
        }[];
    }>;
    transferTeacher(classId: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            replacementTeacher: {
                user: {
                    fullName: string;
                    email: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            fromClass: {
                name: string;
                id: string;
            };
        } & {
            status: string;
            teacherId: string;
            createdAt: Date;
            id: string;
            updatedAt: Date;
            notes: string | null;
            completedAt: Date | null;
            substituteEndDate: Date | null;
            replacementTeacherId: string | null;
            reason: string;
            approvedBy: string | null;
            approvedAt: Date | null;
            fromClassId: string | null;
            toClassId: string | null;
            reasonDetail: string | null;
            requestedBy: string;
            effectiveDate: Date | null;
            feedbackSummary: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    validateTransfer(classId: string, replacementTeacherId: string, effectiveDate?: string, substituteEndDate?: string): Promise<{
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
    getTransferRequests(query: any): Promise<{
        success: boolean;
        data: ({
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            replacementTeacher: {
                user: {
                    fullName: string;
                    email: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            fromClass: {
                name: string;
                id: string;
            };
        } & {
            status: string;
            teacherId: string;
            createdAt: Date;
            id: string;
            updatedAt: Date;
            notes: string | null;
            completedAt: Date | null;
            substituteEndDate: Date | null;
            replacementTeacherId: string | null;
            reason: string;
            approvedBy: string | null;
            approvedAt: Date | null;
            fromClassId: string | null;
            toClassId: string | null;
            reasonDetail: string | null;
            requestedBy: string;
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
    approveTransfer(transferId: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            replacementTeacher: {
                user: {
                    fullName: string;
                    email: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            fromClass: {
                name: string;
                id: string;
            };
        } & {
            status: string;
            teacherId: string;
            createdAt: Date;
            id: string;
            updatedAt: Date;
            notes: string | null;
            completedAt: Date | null;
            substituteEndDate: Date | null;
            replacementTeacherId: string | null;
            reason: string;
            approvedBy: string | null;
            approvedAt: Date | null;
            fromClassId: string | null;
            toClassId: string | null;
            reasonDetail: string | null;
            requestedBy: string;
            effectiveDate: Date | null;
            feedbackSummary: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    rejectTransfer(transferId: string, body: any, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            teacher: {
                user: {
                    fullName: string;
                    email: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            replacementTeacher: {
                user: {
                    fullName: string;
                    email: string;
                };
            } & {
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            fromClass: {
                name: string;
                id: string;
            };
        } & {
            status: string;
            teacherId: string;
            createdAt: Date;
            id: string;
            updatedAt: Date;
            notes: string | null;
            completedAt: Date | null;
            substituteEndDate: Date | null;
            replacementTeacherId: string | null;
            reason: string;
            approvedBy: string | null;
            approvedAt: Date | null;
            fromClassId: string | null;
            toClassId: string | null;
            reasonDetail: string | null;
            requestedBy: string;
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
    deleteSessions(classId: string, body: {
        sessionIds: string[];
    }): Promise<{
        success: boolean;
        data: {
            deletedCount: number;
            requestedCount: number;
            classId: string;
            className: string;
        };
        message: string;
    }>;
    getClassByTeacher(query: any, teacherId: string): Promise<{
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
    getClassByTeacherId(id: string): Promise<{
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
    createClassLegacy(body: any): Promise<{
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
    }>;
}
