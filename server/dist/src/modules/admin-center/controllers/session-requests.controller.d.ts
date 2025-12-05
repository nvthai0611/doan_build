import { SessionRequestsService } from '../services/session-requests.service';
export declare class SessionRequestsController {
    private readonly sessionRequestsService;
    constructor(sessionRequestsService: SessionRequestsService);
    getSessionRequests(query: any): Promise<{
        data: {
            id: string;
            requestType: string;
            teacherId: string;
            classId: string;
            sessionDate: string;
            startTime: string;
            endTime: string;
            roomId: string;
            reason: string;
            notes: string;
            status: string;
            createdAt: string;
            approvedAt: string;
            teacher: {
                user: {
                    email: string;
                    fullName: string;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            class: {
                subject: {
                    name: string;
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
            room: {
                name: string;
                capacity: number;
            };
            approvedByUser: {
                email: string;
                fullName: string;
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        message: string;
    }>;
    createSessionRequest(body: any): Promise<{
        data: {
            id: string;
            requestType: string;
            teacherId: string;
            classId: string;
            sessionDate: string;
            startTime: string;
            endTime: string;
            roomId: string;
            reason: string;
            notes: string;
            status: string;
            createdAt: string;
            teacher: {
                user: {
                    email: string;
                    fullName: string;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            class: {
                subject: {
                    name: string;
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
            room: {
                name: string;
                capacity: number;
            };
        };
        message: string;
    }>;
    approveSessionRequest(id: string, action: 'approve' | 'reject', body: {
        approverId: string;
        notes?: string;
    }): Promise<{
        data: {
            id: string;
            requestType: string;
            teacherId: string;
            classId: string;
            sessionDate: string;
            startTime: string;
            endTime: string;
            roomId: string;
            reason: string;
            notes: string;
            status: string;
            createdAt: string;
            approvedAt: string;
            teacher: {
                user: {
                    email: string;
                    fullName: string;
                };
            } & {
                createdAt: Date;
                updatedAt: Date;
                id: string;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
            class: {
                subject: {
                    name: string;
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
            room: {
                name: string;
                capacity: number;
            };
            approvedByUser: {
                email: string;
                fullName: string;
            };
        };
        message: string;
    }>;
    getSessionRequestById(id: string): Promise<{
        success: boolean;
        data: {
            data: {
                id: string;
                requestType: string;
                teacherId: string;
                classId: string;
                sessionDate: Date;
                startTime: string;
                endTime: string;
                roomId: string;
                reason: string;
                notes: string;
                status: string;
                createdAt: Date;
                approvedAt: Date;
                teacher: {
                    user: {
                        email: string;
                        fullName: string;
                    };
                } & {
                    createdAt: Date;
                    updatedAt: Date;
                    id: string;
                    userId: string;
                    schoolId: string | null;
                    teacherCode: string;
                    subjects: string[];
                };
                class: {
                    subject: {
                        name: string;
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
                room: {
                    name: string;
                    capacity: number;
                };
                approvedByUser: {
                    email: string;
                    fullName: string;
                };
            };
            message: string;
        };
        message: string;
    }>;
}
