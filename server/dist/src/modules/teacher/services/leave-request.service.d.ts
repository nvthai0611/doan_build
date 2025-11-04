import { PrismaService } from 'src/db/prisma.service';
import { AffectedSessionCreateDto, LeaveRequestDto } from '../dto/leave-request/leave-request.dto';
export declare class LeaveRequestService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAffectedSessions(teacherId: string, startDate: string, endDate: string): Promise<{
        id: string;
        date: string;
        time: string;
        className: string;
        room: string;
        selected: boolean;
    }[]>;
    getReplacementTeachers(requestingTeacherId: string, sessionId: string, date: string, time: string): Promise<{
        id: any;
        fullName: any;
        email: any;
        phone: any;
        subjects: any;
        compatibilityScore: number;
        compatibilityReason: string;
        isAvailable: boolean;
        availabilityNote: string;
    }[]>;
    private calculateCompatibilityScore;
    private generateCompatibilityReason;
    createLeaveRequest(teacherId: string, body: LeaveRequestDto, affectedSessions?: AffectedSessionCreateDto[], createdBy?: string): Promise<{
        affectedSessions: ({
            session: {
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
            replacementTeacher: {
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
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
        } & {
            createdAt: Date;
            id: string;
            sessionId: string;
            notes: string | null;
            replacementTeacherId: string | null;
            leaveRequestId: string;
        })[];
    } & {
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
    }>;
    getMyLeaveRequests(teacherId: string, options: {
        page: number;
        limit: number;
        status?: string;
        requestType?: string;
    }): Promise<{
        data: ({
            affectedSessions: ({
                session: {
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
                replacementTeacher: {
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
                    schoolId: string | null;
                    teacherCode: string;
                    subjects: string[];
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
            createdByUser: {
                email: string;
                fullName: string;
            };
        } & {
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
