import { StudentLeaveRequestService } from '../services/student-leave-request.service';
import { CreateStudentLeaveRequestDto, UpdateStudentLeaveRequestDto, GetStudentLeaveRequestsQueryDto, GetSessionsByClassQueryDto } from '../dto/student-leave-request/student-leave-request.dto';
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
                affectedSessions: ({
                    session: {
                        class: {
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
                        room: {
                            name: string;
                            createdAt: Date;
                            id: string;
                            isActive: boolean;
                            capacity: number | null;
                            equipment: import("@prisma/client/runtime/library").JsonValue | null;
                        };
                    } & {
                        status: string;
                        roomId: string | null;
                        teacherId: string | null;
                        createdAt: Date;
                        academicYear: string;
                        id: string;
                        notes: string | null;
                        classId: string;
                        substituteTeacherId: string | null;
                        substituteEndDate: Date | null;
                        sessionDate: Date;
                        startTime: string;
                        endTime: string;
                        cancellationReason: string | null;
                    };
                } & {
                    createdAt: Date;
                    id: string;
                    notes: string | null;
                    sessionId: string;
                    leaveRequestId: string;
                    replacementTeacherId: string | null;
                })[];
                approvedByUser: {
                    fullName: string;
                    email: string;
                };
                status: string;
                teacherId: string | null;
                startDate: Date;
                endDate: Date;
                createdAt: Date;
                id: string;
                notes: string | null;
                studentId: string | null;
                requestType: string;
                reason: string;
                createdBy: string;
                approvedBy: string | null;
                approvedAt: Date | null;
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
    getSessionsByClass(query: GetSessionsByClassQueryDto): Promise<{
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
            affectedSessions: ({
                session: {
                    class: {
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
                    room: {
                        name: string;
                        createdAt: Date;
                        id: string;
                        isActive: boolean;
                        capacity: number | null;
                        equipment: import("@prisma/client/runtime/library").JsonValue | null;
                    };
                } & {
                    status: string;
                    roomId: string | null;
                    teacherId: string | null;
                    createdAt: Date;
                    academicYear: string;
                    id: string;
                    notes: string | null;
                    classId: string;
                    substituteTeacherId: string | null;
                    substituteEndDate: Date | null;
                    sessionDate: Date;
                    startTime: string;
                    endTime: string;
                    cancellationReason: string | null;
                };
            } & {
                createdAt: Date;
                id: string;
                notes: string | null;
                sessionId: string;
                leaveRequestId: string;
                replacementTeacherId: string | null;
            })[];
            approvedByUser: {
                fullName: string;
                email: string;
            };
            status: string;
            teacherId: string | null;
            startDate: Date;
            endDate: Date;
            createdAt: Date;
            id: string;
            notes: string | null;
            studentId: string | null;
            requestType: string;
            reason: string;
            createdBy: string;
            approvedBy: string | null;
            approvedAt: Date | null;
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
            affectedSessions: ({
                session: {
                    class: {
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
                    room: {
                        name: string;
                        createdAt: Date;
                        id: string;
                        isActive: boolean;
                        capacity: number | null;
                        equipment: import("@prisma/client/runtime/library").JsonValue | null;
                    };
                } & {
                    status: string;
                    roomId: string | null;
                    teacherId: string | null;
                    createdAt: Date;
                    academicYear: string;
                    id: string;
                    notes: string | null;
                    classId: string;
                    substituteTeacherId: string | null;
                    substituteEndDate: Date | null;
                    sessionDate: Date;
                    startTime: string;
                    endTime: string;
                    cancellationReason: string | null;
                };
            } & {
                createdAt: Date;
                id: string;
                notes: string | null;
                sessionId: string;
                leaveRequestId: string;
                replacementTeacherId: string | null;
            })[];
            status: string;
            teacherId: string | null;
            startDate: Date;
            endDate: Date;
            createdAt: Date;
            id: string;
            notes: string | null;
            studentId: string | null;
            requestType: string;
            reason: string;
            createdBy: string;
            approvedBy: string | null;
            approvedAt: Date | null;
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
            affectedSessions: ({
                session: {
                    class: {
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
                    room: {
                        name: string;
                        createdAt: Date;
                        id: string;
                        isActive: boolean;
                        capacity: number | null;
                        equipment: import("@prisma/client/runtime/library").JsonValue | null;
                    };
                } & {
                    status: string;
                    roomId: string | null;
                    teacherId: string | null;
                    createdAt: Date;
                    academicYear: string;
                    id: string;
                    notes: string | null;
                    classId: string;
                    substituteTeacherId: string | null;
                    substituteEndDate: Date | null;
                    sessionDate: Date;
                    startTime: string;
                    endTime: string;
                    cancellationReason: string | null;
                };
            } & {
                createdAt: Date;
                id: string;
                notes: string | null;
                sessionId: string;
                leaveRequestId: string;
                replacementTeacherId: string | null;
            })[];
            status: string;
            teacherId: string | null;
            startDate: Date;
            endDate: Date;
            createdAt: Date;
            id: string;
            notes: string | null;
            studentId: string | null;
            requestType: string;
            reason: string;
            createdBy: string;
            approvedBy: string | null;
            approvedAt: Date | null;
            imageUrl: string | null;
        };
        message: string;
    }>;
    cancelStudentLeaveRequest(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
