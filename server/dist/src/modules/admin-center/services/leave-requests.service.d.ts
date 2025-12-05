import { PrismaService } from 'src/db/prisma.service';
export declare class LeaveRequestsService {
    private prisma;
    constructor(prisma: PrismaService);
    getLeaveRequests(params: any): Promise<{
        data: {
            id: string;
            type: string;
            reason: string;
            startDate: string;
            endDate: string;
            status: string;
            submittedDate: string;
            approvedBy: string;
            approvedDate: string;
            notes: string;
            teacherId: string;
            teacherInfo: {
                email: string;
                fullName: string;
            };
            affectedSessions: ({
                session: {
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
            createdAt: string;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        message: string;
    }>;
    createLeaveRequest(leaveRequestData: {
        teacherId: string;
        requestType: string;
        reason: string;
        startDate: string;
        endDate: string;
        notes?: string;
    }): Promise<{
        data: {
            id: string;
            type: string;
            reason: string;
            startDate: string;
            endDate: string;
            status: string;
            submittedDate: string;
            approvedBy: any;
            approvedDate: any;
            notes: string;
            teacherId: string;
        };
        message: string;
    }>;
    updateLeaveRequest(leaveRequestId: string, updateData: {
        requestType?: string;
        reason?: string;
        startDate?: string;
        endDate?: string;
        notes?: string;
    }): Promise<{
        data: {
            id: string;
            type: string;
            reason: string;
            startDate: string;
            endDate: string;
            status: string;
            submittedDate: string;
            approvedBy: any;
            approvedDate: any;
            notes: string;
            teacherId: string;
        };
        message: string;
    }>;
    deleteLeaveRequest(leaveRequestId: string): Promise<{
        message: string;
    }>;
    approveLeaveRequest(leaveRequestId: string, action: 'approve' | 'reject', approverId: string, notes?: string): Promise<{
        data: {
            id: string;
            type: string;
            reason: string;
            startDate: string;
            endDate: string;
            status: string;
            submittedDate: string;
            approvedBy: string;
            approvedDate: string;
            notes: string;
            teacherId: string;
        };
        message: string;
    }>;
    getLeaveRequestStats(teacherId: string): Promise<{
        data: {
            totalRequests: number;
            pendingRequests: number;
            approvedRequests: number;
            rejectedRequests: number;
        };
        message: string;
    }>;
    getLeaveRequestById(id: string): Promise<{
        data: {
            id: string;
            type: string;
            reason: string;
            startDate: Date;
            endDate: Date;
            status: string;
            submittedDate: Date;
            approvedBy: string;
            approvedDate: Date;
            notes: string;
            teacherId: string;
            createdAt: Date;
            teacherInfo: {
                email: string;
                fullName: string;
            };
            affectedSessions: {
                id: string;
                sessionDate: Date;
                startTime: string;
                endTime: string;
                class: string;
                subject: string;
            }[];
        };
        message: string;
    }>;
}
