import { PrismaService } from '../../../db/prisma.service';
export declare class ScheduleConflictService {
    private prisma;
    constructor(prisma: PrismaService);
    getRoomConflicts(query?: any): Promise<{
        success: boolean;
        message: string;
        data: any[];
        meta: {
            startDate: Date;
            endDate: Date;
            totalConflicts: number;
        };
    }>;
    getTeacherAvailableSlots(teacherId: string, query?: any): Promise<{
        success: boolean;
        message: string;
        data: {
            teacherId: string;
            teacherName: string;
            busySlots: Record<string, any[]>;
        };
        meta: {
            startDate: Date;
            endDate: Date;
        };
    }>;
    addSession(body: any): Promise<{
        success: boolean;
        message: string;
        conflicts: any;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            teacher: {
                user: {
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
                name: string;
            };
            room: {
                name: string;
            };
        } & {
            academicYear: string;
            createdAt: Date;
            id: string;
            roomId: string | null;
            status: string;
            teacherId: string | null;
            classId: string;
            substituteTeacherId: string | null;
            substituteEndDate: Date | null;
            sessionDate: Date;
            startTime: string;
            endTime: string;
            notes: string | null;
            cancellationReason: string | null;
        };
        conflicts?: undefined;
    }>;
    private isTimeOverlap;
}
