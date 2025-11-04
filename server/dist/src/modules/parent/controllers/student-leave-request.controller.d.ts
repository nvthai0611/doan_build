import { StudentLeaveRequestService } from '../services/student-leave-request.service';
import { CreateStudentLeaveRequestDto, UpdateStudentLeaveRequestDto, GetStudentLeaveRequestsQueryDto, GetAffectedSessionsQueryDto } from '../dto/student-leave-request/student-leave-request.dto';
export declare class StudentLeaveRequestController {
    private readonly studentLeaveRequestService;
    constructor(studentLeaveRequestService: StudentLeaveRequestService);
    getStudentLeaveRequests(req: any, query: GetStudentLeaveRequestsQueryDto): Promise<{
        success: boolean;
        data: {
            data: any[];
            meta: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
            counts?: undefined;
        } | {
            data: {
                classes: any[];
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
                affectedSessions: ({
                    session: {
                        class: {
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
                        room: {
                            createdAt: Date;
                            isActive: boolean;
                            id: string;
                            name: string;
                            capacity: number | null;
                            equipment: import("@prisma/client/runtime/library").JsonValue | null;
                        };
                    } & {
                        academicYear: string;
                        createdAt: Date;
                        id: string;
                        roomId: string | null;
                        teacherId: string | null;
                        status: string;
                        classId: string;
                        substituteTeacherId: string | null;
                        substituteEndDate: Date | null;
                        sessionDate: Date;
                        startTime: string;
                        endTime: string;
                        notes: string | null;
                        cancellationReason: string | null;
                    };
                } & {
                    createdAt: Date;
                    id: string;
                    sessionId: string;
                    notes: string | null;
                    replacementTeacherId: string | null;
                    leaveRequestId: string;
                })[];
                approvedByUser: {
                    email: string;
                    fullName: string;
                };
                createdAt: Date;
                id: string;
                teacherId: string | null;
                status: string;
                startDate: Date;
                studentId: string | null;
                notes: string | null;
                reason: string;
                endDate: Date;
                approvedBy: string | null;
                approvedAt: Date | null;
                requestType: string;
                createdBy: string;
                imageUrl: string | null;
            }[];
            meta: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
            counts: {
                pending: number;
                approved: number;
                rejected: number;
                cancelled: number;
                all: number;
            };
        };
        message: string;
    }>;
    getAffectedSessions(query: GetAffectedSessionsQueryDto): Promise<{
        success: boolean;
        data: {
            id: string;
            date: string;
            time: string;
            className: string;
            subjectName: string;
            room: string;
        }[];
        message: string;
    }>;
    getStudentLeaveRequestById(req: any, id: string): Promise<{
        success: boolean;
        data: {
            classes: any[];
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
            affectedSessions: ({
                session: {
                    class: {
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
                    room: {
                        createdAt: Date;
                        isActive: boolean;
                        id: string;
                        name: string;
                        capacity: number | null;
                        equipment: import("@prisma/client/runtime/library").JsonValue | null;
                    };
                } & {
                    academicYear: string;
                    createdAt: Date;
                    id: string;
                    roomId: string | null;
                    teacherId: string | null;
                    status: string;
                    classId: string;
                    substituteTeacherId: string | null;
                    substituteEndDate: Date | null;
                    sessionDate: Date;
                    startTime: string;
                    endTime: string;
                    notes: string | null;
                    cancellationReason: string | null;
                };
            } & {
                createdAt: Date;
                id: string;
                sessionId: string;
                notes: string | null;
                replacementTeacherId: string | null;
                leaveRequestId: string;
            })[];
            approvedByUser: {
                email: string;
                fullName: string;
            };
            createdAt: Date;
            id: string;
            teacherId: string | null;
            status: string;
            startDate: Date;
            studentId: string | null;
            notes: string | null;
            reason: string;
            endDate: Date;
            approvedBy: string | null;
            approvedAt: Date | null;
            requestType: string;
            createdBy: string;
            imageUrl: string | null;
        };
        message: string;
    }>;
    createStudentLeaveRequest(req: any, dto: CreateStudentLeaveRequestDto): Promise<{
        success: boolean;
        data: {
            classes: any[];
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
            affectedSessions: ({
                session: {
                    class: {
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
                    room: {
                        createdAt: Date;
                        isActive: boolean;
                        id: string;
                        name: string;
                        capacity: number | null;
                        equipment: import("@prisma/client/runtime/library").JsonValue | null;
                    };
                } & {
                    academicYear: string;
                    createdAt: Date;
                    id: string;
                    roomId: string | null;
                    teacherId: string | null;
                    status: string;
                    classId: string;
                    substituteTeacherId: string | null;
                    substituteEndDate: Date | null;
                    sessionDate: Date;
                    startTime: string;
                    endTime: string;
                    notes: string | null;
                    cancellationReason: string | null;
                };
            } & {
                createdAt: Date;
                id: string;
                sessionId: string;
                notes: string | null;
                replacementTeacherId: string | null;
                leaveRequestId: string;
            })[];
            createdAt: Date;
            id: string;
            teacherId: string | null;
            status: string;
            startDate: Date;
            studentId: string | null;
            notes: string | null;
            reason: string;
            endDate: Date;
            approvedBy: string | null;
            approvedAt: Date | null;
            requestType: string;
            createdBy: string;
            imageUrl: string | null;
        };
        message: string;
    }>;
    updateStudentLeaveRequest(req: any, id: string, dto: UpdateStudentLeaveRequestDto): Promise<{
        success: boolean;
        data: {
            classes: any[];
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
            affectedSessions: ({
                session: {
                    class: {
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
                    room: {
                        createdAt: Date;
                        isActive: boolean;
                        id: string;
                        name: string;
                        capacity: number | null;
                        equipment: import("@prisma/client/runtime/library").JsonValue | null;
                    };
                } & {
                    academicYear: string;
                    createdAt: Date;
                    id: string;
                    roomId: string | null;
                    teacherId: string | null;
                    status: string;
                    classId: string;
                    substituteTeacherId: string | null;
                    substituteEndDate: Date | null;
                    sessionDate: Date;
                    startTime: string;
                    endTime: string;
                    notes: string | null;
                    cancellationReason: string | null;
                };
            } & {
                createdAt: Date;
                id: string;
                sessionId: string;
                notes: string | null;
                replacementTeacherId: string | null;
                leaveRequestId: string;
            })[];
            createdAt: Date;
            id: string;
            teacherId: string | null;
            status: string;
            startDate: Date;
            studentId: string | null;
            notes: string | null;
            reason: string;
            endDate: Date;
            approvedBy: string | null;
            approvedAt: Date | null;
            requestType: string;
            createdBy: string;
            imageUrl: string | null;
        };
        message: string;
    }>;
    cancelStudentLeaveRequest(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
