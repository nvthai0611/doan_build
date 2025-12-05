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
            replacementTeacher: {
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
                createdAt: Date;
                id: string;
                updatedAt: Date;
                userId: string;
                schoolId: string | null;
                teacherCode: string;
                subjects: string[];
            };
        } & {
            createdAt: Date;
            id: string;
            notes: string | null;
            sessionId: string;
            leaveRequestId: string;
            replacementTeacherId: string | null;
        })[];
    } & {
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
    getMyLeaveRequests(teacherId: string, options: {
        page: number;
        limit: number;
        status?: string;
        requestType?: string;
    }): Promise<{
        data: {
            status: string;
            startDate: Date;
            endDate: Date;
            createdAt: Date;
            id: string;
            requestType: string;
            reason: string;
            createdBy: string;
            approvedBy: string;
            affectedSessions: {
                id: string;
                notes: string;
                session: {
                    class: {
                        name: string;
                        subject: {
                            name: string;
                        };
                    };
                    room: {
                        name: string;
                    };
                    id: string;
                    notes: string;
                    sessionDate: Date;
                    startTime: string;
                    endTime: string;
                };
            }[];
            approvedByUser: {
                fullName: string;
                email: string;
            };
            createdByUser: {
                fullName: string;
                email: string;
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    cancelLeaveRequest(teacherId: string, leaveRequestId: string): Promise<{
        success: boolean;
    }>;
}
