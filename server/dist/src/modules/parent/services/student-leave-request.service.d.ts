import { PrismaService } from 'src/db/prisma.service';
import { CreateStudentLeaveRequestDto, UpdateStudentLeaveRequestDto, GetStudentLeaveRequestsQueryDto, GetSessionsByClassQueryDto } from '../dto/student-leave-request/student-leave-request.dto';
export declare class StudentLeaveRequestService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStudentLeaveRequests(parentUserId: string, query: GetStudentLeaveRequestsQueryDto): Promise<{
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
    }>;
    getStudentLeaveRequestById(parentUserId: string, leaveRequestId: string): Promise<{
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
    }>;
    createStudentLeaveRequest(parentUserId: string, dto: CreateStudentLeaveRequestDto): Promise<{
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
    }>;
    updateStudentLeaveRequest(parentUserId: string, leaveRequestId: string, dto: UpdateStudentLeaveRequestDto): Promise<{
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
    }>;
    cancelStudentLeaveRequest(parentUserId: string, leaveRequestId: string): Promise<{
        success: boolean;
    }>;
    getChildClasses(parentUserId: string, studentId: string): Promise<{
        id: string;
        name: string;
        subject: {
            name: string;
            description: string | null;
            id: string;
            code: string;
        };
        teacher: {
            id: string;
            user: {
                fullName: string;
                email: string;
            };
        };
        schedule: {
            date: string;
            startTime: string;
            endTime: string;
        }[];
    }[]>;
    getAllChildrenClasses(parentUserId: string): Promise<{
        id: string;
        name: string;
        subject: {
            name: string;
            description: string | null;
            id: string;
            code: string;
        };
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
        room: {
            name: string;
            createdAt: Date;
            id: string;
            isActive: boolean;
            capacity: number | null;
            equipment: import("@prisma/client/runtime/library").JsonValue | null;
        };
        grade: {
            name: string;
            description: string | null;
            level: number;
            id: string;
            isActive: boolean;
        };
        sessions: {
            status: string;
            id: string;
            sessionDate: Date;
            startTime: string;
            endTime: string;
        }[];
        student: {
            id: string;
            user: {
                fullName: string;
                email: string;
            };
        };
    }[]>;
    getSessionsByClass(query: GetSessionsByClassQueryDto): Promise<{
        id: string;
        date: string;
        time: string;
        className: string;
        subjectName: string;
        room: string;
    }[]>;
}
