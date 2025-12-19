import { PrismaService } from 'src/db/prisma.service';
export declare class ScheduleChangeAdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getScheduleChanges(query: any): Promise<{
        success: boolean;
        data: ({
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
                    name: string;
                };
                id: string;
                name: string;
            };
            newRoom: {
                id: string;
                name: string;
                capacity: number;
            };
        } & {
            id: string;
            status: string;
            processedAt: Date | null;
            classId: string;
            reason: string;
            requestedBy: string;
            originalDate: Date;
            originalTime: string;
            newDate: Date;
            newTime: string;
            newRoomId: string | null;
            requestedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getScheduleChangeById(id: string): Promise<{
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
                name: string;
            };
            id: string;
            name: string;
        };
        newRoom: {
            id: string;
            name: string;
            capacity: number;
        };
    } & {
        id: string;
        status: string;
        processedAt: Date | null;
        classId: string;
        reason: string;
        requestedBy: string;
        originalDate: Date;
        originalTime: string;
        newDate: Date;
        newTime: string;
        newRoomId: string | null;
        requestedAt: Date;
    }>;
    handleScheduleChange(id: string, action: 'approve' | 'reject', notes?: string): Promise<{
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
                name: string;
            };
            id: string;
            name: string;
        };
        newRoom: {
            id: string;
            name: string;
            capacity: number;
        };
    } & {
        id: string;
        status: string;
        processedAt: Date | null;
        classId: string;
        reason: string;
        requestedBy: string;
        originalDate: Date;
        originalTime: string;
        newDate: Date;
        newTime: string;
        newRoomId: string | null;
        requestedAt: Date;
    }>;
    private checkScheduleConflict;
}
