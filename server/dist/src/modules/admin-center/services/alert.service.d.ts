import { PrismaService } from '../../../db/prisma.service';
import { CreateAlertDto, UpdateAlertDto, GetAlertsDto } from '../dto/alert.dto';
export declare class AlertService {
    private prisma;
    constructor(prisma: PrismaService);
    createAlert(createAlertDto: CreateAlertDto): Promise<{
        data: {
            id: bigint;
            title: string;
            alertType: string;
            message: string;
            severity: number;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            isRead: boolean;
            processed: boolean;
            triggeredAt: Date;
            processedAt: Date | null;
        };
        message: string;
    }>;
    getAlerts(params: GetAlertsDto): Promise<{
        data: {
            id: bigint;
            title: string;
            alertType: string;
            message: string;
            severity: number;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            isRead: boolean;
            processed: boolean;
            triggeredAt: Date;
            processedAt: Date | null;
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
    getUnreadCount(): Promise<{
        data: {
            count: number;
        };
        message: string;
    }>;
    updateAlert(id: string, updateAlertDto: UpdateAlertDto): Promise<{
        data: {
            id: bigint;
            title: string;
            alertType: string;
            message: string;
            severity: number;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            isRead: boolean;
            processed: boolean;
            triggeredAt: Date;
            processedAt: Date | null;
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
            title: string;
            alertType: string;
            message: string;
            severity: number;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            isRead: boolean;
            processed: boolean;
            triggeredAt: Date;
            processedAt: Date | null;
        };
        message: string;
    }>;
    createLeaveRequestAlert(leaveRequestData: any): Promise<{
        data: {
            id: bigint;
            title: string;
            alertType: string;
            message: string;
            severity: number;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            isRead: boolean;
            processed: boolean;
            triggeredAt: Date;
            processedAt: Date | null;
        };
        message: string;
    }>;
    createSessionRequestAlert(sessionRequestData: any): Promise<{
        data: {
            id: bigint;
            title: string;
            alertType: string;
            message: string;
            severity: number;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            isRead: boolean;
            processed: boolean;
            triggeredAt: Date;
            processedAt: Date | null;
        };
        message: string;
    }>;
    createIncidentReportAlert(incidentData: any): Promise<{
        data: {
            id: bigint;
            title: string;
            alertType: string;
            message: string;
            severity: number;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            isRead: boolean;
            processed: boolean;
            triggeredAt: Date;
            processedAt: Date | null;
        };
        message: string;
    }>;
    createStudentClassRequestAlert(requestData: any): Promise<{
        data: {
            id: bigint;
            title: string;
            alertType: string;
            message: string;
            severity: number;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            isRead: boolean;
            processed: boolean;
            triggeredAt: Date;
            processedAt: Date | null;
        };
        message: string;
    }>;
}
