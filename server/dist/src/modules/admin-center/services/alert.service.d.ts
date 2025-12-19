import { PrismaService } from '../../../db/prisma.service';
import { CreateAlertDto, UpdateAlertDto, GetAlertsDto } from '../dto/alert.dto';
export declare class AlertService {
    private prisma;
    constructor(prisma: PrismaService);
    createAlert(createAlertDto: CreateAlertDto): Promise<{
        data: {
            id: bigint;
            message: string;
            processedAt: Date | null;
            alertType: string;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            triggeredAt: Date;
            processed: boolean;
            severity: number;
            title: string;
            isRead: boolean;
        };
        message: string;
    }>;
    getAlerts(params: GetAlertsDto, userId?: string, userRole?: string): Promise<{
        data: {
            id: bigint;
            message: string;
            processedAt: Date | null;
            alertType: string;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            triggeredAt: Date;
            processed: boolean;
            severity: number;
            title: string;
            isRead: boolean;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            unreadCount: number;
        };
        message: string;
    }>;
    getUnreadCount(userId?: string, userRole?: string): Promise<{
        data: {
            count: number;
        };
        message: string;
    }>;
    updateAlert(id: string, updateAlertDto: UpdateAlertDto): Promise<{
        data: {
            id: bigint;
            message: string;
            processedAt: Date | null;
            alertType: string;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            triggeredAt: Date;
            processed: boolean;
            severity: number;
            title: string;
            isRead: boolean;
        };
        message: string;
    }>;
    markAllAsRead(): Promise<{
        data: {
            count: number;
        };
        message: string;
    }>;
    deleteAlert(id: string): Promise<{
        message: string;
    }>;
    createParentRegistrationAlert(parentData: any): Promise<{
        data: {
            id: bigint;
            message: string;
            processedAt: Date | null;
            alertType: string;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            triggeredAt: Date;
            processed: boolean;
            severity: number;
            title: string;
            isRead: boolean;
        };
        message: string;
    }>;
    createLeaveRequestAlert(leaveRequestData: any): Promise<{
        data: {
            id: bigint;
            message: string;
            processedAt: Date | null;
            alertType: string;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            triggeredAt: Date;
            processed: boolean;
            severity: number;
            title: string;
            isRead: boolean;
        };
        message: string;
    }>;
    createSessionRequestAlert(sessionRequestData: any): Promise<{
        data: {
            id: bigint;
            message: string;
            processedAt: Date | null;
            alertType: string;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            triggeredAt: Date;
            processed: boolean;
            severity: number;
            title: string;
            isRead: boolean;
        };
        message: string;
    }>;
    createIncidentReportAlert(incidentData: any): Promise<{
        data: {
            id: bigint;
            message: string;
            processedAt: Date | null;
            alertType: string;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            triggeredAt: Date;
            processed: boolean;
            severity: number;
            title: string;
            isRead: boolean;
        };
        message: string;
    }>;
    createStudentClassRequestAlert(requestData: any): Promise<{
        data: {
            id: bigint;
            message: string;
            processedAt: Date | null;
            alertType: string;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            triggeredAt: Date;
            processed: boolean;
            severity: number;
            title: string;
            isRead: boolean;
        };
        message: string;
    }>;
}
